import operator
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models import BusinessRule

OPERATORS = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "==": operator.eq,
    "=": operator.eq,
    "!=": operator.ne,
}


@dataclass
class BREContext:
    age: int
    monthly_income: float
    credit_score: int
    loan_amount: float
    property_value: float

    @property
    def loan_to_property_ratio(self) -> float:
        return self.loan_amount / self.property_value if self.property_value else float("inf")


def evaluate_rules(db: Session, context: BREContext):
    rules = db.query(BusinessRule).filter(BusinessRule.active.is_(True)).all()
    reasons = []

    for rule in rules:
        if rule.field_name == "age":
            actual = context.age
        elif rule.field_name == "monthly_income":
            actual = context.monthly_income
        elif rule.field_name == "credit_score":
            actual = context.credit_score
        elif rule.field_name == "loan_amount":
            actual = context.loan_amount
        elif rule.field_name == "loan_to_property_ratio":
            actual = context.loan_to_property_ratio
        else:
            # Unknown fields are ignored rather than silently failing an application.
            continue

        compare = OPERATORS.get(rule.operator)
        if not compare:
            reasons.append(f"Invalid operator configured for rule {rule.id}")
            continue

        if not compare(actual, rule.value):
            reasons.append(rule.description or f"{rule.field_name} {rule.operator} {rule.value} requirement not met")

    return len(reasons) == 0, reasons
