from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.models import AdminUser, BusinessRule
from app.auth.security import hash_password
from app.routers import auth, leads, rules



# DATABASE SETUP

Base.metadata.create_all(bind=engine)



# FASTAPI APP

app = FastAPI(
    title="MoneyBeing Loan Eligibility API",
    version="1.0.0",
)


# CORS CONFIGURATION

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Next.js frontend
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Vite frontend support
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ROUTERS

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(rules.router)



# SEED DEFAULT DATA

def seed_data():
    db = SessionLocal()

    try:
        
        # Create default admin
        
        admin = (
            db.query(AdminUser)
            .filter(AdminUser.username == "admin")
            .first()
        )

        if not admin:
            db.add(
                AdminUser(
                    username="admin",
                    password_hash=hash_password("Admin@123"),
                )
            )

        
        # Create default BRE rules

        if db.query(BusinessRule).count() == 0:
            db.add_all([
                BusinessRule(
                    field_name="age",
                    operator=">=",
                    value=21,
                    description="Age must be at least 21",
                ),

                BusinessRule(
                    field_name="age",
                    operator="<=",
                    value=60,
                    description="Age must not exceed 60",
                ),

                BusinessRule(
                    field_name="monthly_income",
                    operator=">=",
                    value=30000,
                    description="Monthly income below minimum requirement",
                ),

                BusinessRule(
                    field_name="credit_score",
                    operator=">=",
                    value=700,
                    description="Credit score below minimum requirement",
                ),

                BusinessRule(
                    field_name="loan_to_property_ratio",
                    operator="<=",
                    value=0.80,
                    description="Loan amount exceeds 80% of property value",
                ),
            ])

        db.commit()

    finally:
        db.close()


# Run seed data
seed_data()

# ROOT ENDPOINT

@app.get("/")
def root():
    return {
        "message": "MoneyBeing Loan Eligibility API is running"
    }