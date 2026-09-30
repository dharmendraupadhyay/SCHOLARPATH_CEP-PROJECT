from pydantic import BaseModel
from typing import Optional


class RecommendationRequest(BaseModel):
    education_level: str          # 10th / 12th / undergraduate / postgraduate / phd
    stream: str = "ALL"           # Science / Arts / Commerce / Engineering / Medical / ALL
    percentage: float = 0.0       # Percentage / CGPA
    annual_income: int = 0        # Annual family income in ₹
    gender: str = "all"           # male / female / other → maps to all/female/male
    state: str = "ALL"            # Indian state name
    caste: str = "ALL"            # General / OBC / SC / ST
    religion: str = "ALL"         # Hindu / Muslim / Christian / Sikh / Other / ALL
    has_disability: bool = False
    is_sports: bool = False
    is_minority: bool = False


class ScholarshipSummary(BaseModel):
    scholarship_id: str
    scholarship_name: str
    provider: Optional[str]
    type: Optional[str]
    level: Optional[str]
    eligible_categories: Optional[str]
    domicile_requirement: Optional[str]
    income_limit: Optional[str]
    scholarship_amount: Optional[str]
    application_period: Optional[str]
    official_portal: Optional[str]


class ScholarshipDetail(BaseModel):
    scholarship_id: str
    scholarship_name: str
    provider: Optional[str]
    type: Optional[str]
    level: Optional[str]
    eligible_courses: Optional[str]
    eligible_categories: Optional[str]
    domicile_requirement: Optional[str]
    income_limit: Optional[str]
    minimum_marks: Optional[str]
    scholarship_amount: Optional[str]
    benefits: Optional[str]
    application_period: Optional[str]
    official_portal: Optional[str]
    required_documents: Optional[str]
    renewal: Optional[str]
    remarks: Optional[str]
