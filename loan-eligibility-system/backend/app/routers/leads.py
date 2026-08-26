import json
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead
from app.schemas.lead import LeadCreate, LeadListResponse, LeadResponse
from app.services.bre import BREContext, evaluate_rules
from app.services.credit_score import fetch_credit_score

router = APIRouter(prefix="/api/leads", tags=["Leads"])


def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


@router.post("", response_model=dict)
async def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    existing = db.query(Lead).filter(Lead.mobile == payload.mobile).first()
    if existing:
        raise HTTPException(status_code=409, detail="Lead already exists")

    try:
        score = await fetch_credit_score(payload.mobile)
    except Exception:
        raise HTTPException(status_code=503, detail="Credit score service unavailable")

    context = BREContext(
        age=calculate_age(payload.date_of_birth),
        monthly_income=payload.monthly_income,
        credit_score=score,
        loan_amount=payload.loan_amount,
        property_value=payload.property_value,
    )
    eligible, reasons = evaluate_rules(db, context)

    lead = Lead(
        **payload.model_dump(),
        credit_score=score,
        bre_status="Eligible" if eligible else "Not Eligible",
        rejection_reasons=json.dumps(reasons),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return {
        "status": "success",
        "lead_id": lead.id,
        "credit_score": score,
        "bre_status": lead.bre_status,
        "reasons": reasons,
    }


@router.get("", response_model=LeadListResponse)
def list_leads(
    search: str | None = None,
    bre_status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Lead)
    if search:
        term = f"%{search}%"
        query = query.filter((Lead.full_name.ilike(term)) | (Lead.mobile.ilike(term)))
    if bre_status:
        query = query.filter(Lead.bre_status == bre_status)

    total = query.count()
    leads = query.order_by(Lead.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    items = []
    for lead in leads:
        items.append(LeadResponse(
            id=lead.id,
            full_name=lead.full_name,
            mobile=lead.mobile,
            loan_type=lead.loan_type,
            credit_score=lead.credit_score,
            bre_status=lead.bre_status,
            rejection_reasons=json.loads(lead.rejection_reasons or "[]"),
            created_at=lead.created_at,
        ))
    return LeadListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total = db.query(func.count(Lead.id)).scalar() or 0
    eligible = db.query(func.count(Lead.id)).filter(Lead.bre_status == "Eligible").scalar() or 0
    rejected = db.query(func.count(Lead.id)).filter(Lead.bre_status == "Not Eligible").scalar() or 0
    avg_score = db.query(func.avg(Lead.credit_score)).scalar()
    return {
        "total_leads": total,
        "eligible_leads": eligible,
        "rejected_leads": rejected,
        "average_credit_score": round(float(avg_score), 2) if avg_score is not None else 0,
    }
