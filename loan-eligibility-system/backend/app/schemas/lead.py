from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    mobile: str = Field(min_length=10, max_length=15)
    email: EmailStr
    date_of_birth: date
    city: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=6, max_length=6)
    loan_type: str
    employment_type: str
    monthly_income: float = Field(gt=0)
    loan_amount: float = Field(gt=0)
    property_value: float = Field(gt=0)
    consent: bool

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str):
        if not value.isdigit():
            raise ValueError("Mobile number must contain digits only")
        return value

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, value: str):
        if not value.isdigit():
            raise ValueError("Pincode must contain digits only")
        return value

    @field_validator("loan_type")
    @classmethod
    def validate_loan_type(cls, value: str):
        if value not in {"Home Loan", "Loan Against Property (LAP)"}:
            raise ValueError("Invalid loan type")
        return value

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, value: str):
        if value not in {"Salaried", "Self Employed"}:
            raise ValueError("Invalid employment type")
        return value

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, value: bool):
        if not value:
            raise ValueError("Consent is mandatory")
        return value


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    mobile: str
    loan_type: str
    credit_score: int | None
    bre_status: str | None
    rejection_reasons: list[str]
    created_at: datetime


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    page_size: int
