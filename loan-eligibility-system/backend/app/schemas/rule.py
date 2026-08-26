from pydantic import BaseModel, Field


class RuleCreate(BaseModel):
    field_name: str = Field(min_length=1)
    operator: str
    value: float
    active: bool = True
    description: str | None = None


class RuleResponse(RuleCreate):
    id: int
