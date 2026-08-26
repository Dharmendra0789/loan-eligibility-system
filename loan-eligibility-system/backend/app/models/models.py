from datetime import datetime
from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String, Text
from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    city = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    loan_type = Column(String(50), nullable=False)
    employment_type = Column(String(50), nullable=False)
    monthly_income = Column(Float, nullable=False)
    loan_amount = Column(Float, nullable=False)
    property_value = Column(Float, nullable=False)
    consent = Column(Boolean, nullable=False)
    credit_score = Column(Integer, nullable=True)
    bre_status = Column(String(30), nullable=True)
    rejection_reasons = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class BusinessRule(Base):
    __tablename__ = "business_rules"

    id = Column(Integer, primary_key=True, index=True)
    field_name = Column(String(100), nullable=False)
    operator = Column(String(10), nullable=False)
    value = Column(Float, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    description = Column(String(255), nullable=True)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
