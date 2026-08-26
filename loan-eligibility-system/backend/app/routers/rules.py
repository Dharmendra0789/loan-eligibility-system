from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_admin
from app.database import get_db
from app.models import BusinessRule
from app.schemas.rule import RuleCreate, RuleResponse

router = APIRouter(prefix="/api/rules", tags=["BRE Management"])
VALID_OPERATORS = {">", ">=", "<", "<=", "==", "=", "!="}


@router.get("", response_model=list[RuleResponse])
def list_rules(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(BusinessRule).order_by(BusinessRule.id).all()


@router.post("", response_model=RuleResponse)
def add_rule(payload: RuleCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    if payload.operator not in VALID_OPERATORS:
        raise HTTPException(400, "Invalid operator")
    rule = BusinessRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=RuleResponse)
def update_rule(rule_id: int, payload: RuleCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    rule = db.get(BusinessRule, rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    if payload.operator not in VALID_OPERATORS:
        raise HTTPException(400, "Invalid operator")
    for key, value in payload.model_dump().items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    rule = db.get(BusinessRule, rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.delete(rule)
    db.commit()
    return {"status": "success", "message": "Rule deleted"}
