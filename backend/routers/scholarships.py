from fastapi import APIRouter, HTTPException, Query
from database import get_connection
from models import RecommendationRequest, ScholarshipSummary, ScholarshipDetail
from typing import List, Optional
import mysql.connector

router = APIRouter(prefix="/api", tags=["scholarships"])


def row_to_summary(row: dict) -> ScholarshipSummary:
    return ScholarshipSummary(
        scholarship_id=row["scholarship_id"],
        scholarship_name=row["scholarship_name"],
        provider=row.get("provider"),
        type=row.get("type"),
        level=row.get("level"),
        eligible_categories=row.get("eligible_categories"),
        domicile_requirement=row.get("domicile_requirement"),
        income_limit=row.get("income_limit"),
        scholarship_amount=row.get("scholarship_amount"),
        application_period=row.get("application_period"),
        official_portal=row.get("official_portal"),
    )


def row_to_detail(row: dict) -> ScholarshipDetail:
    return ScholarshipDetail(
        scholarship_id=row["scholarship_id"],
        scholarship_name=row["scholarship_name"],
        provider=row.get("provider"),
        type=row.get("type"),
        level=row.get("level"),
        eligible_courses=row.get("eligible_courses"),
        eligible_categories=row.get("eligible_categories"),
        domicile_requirement=row.get("domicile_requirement"),
        income_limit=row.get("income_limit"),
        minimum_marks=row.get("minimum_marks"),
        scholarship_amount=row.get("scholarship_amount"),
        benefits=row.get("benefits"),
        application_period=row.get("application_period"),
        official_portal=row.get("official_portal"),
        required_documents=row.get("required_documents"),
        renewal=row.get("renewal"),
        remarks=row.get("remarks"),
    )


# ──────────────────────────────────────────────
# GET /api/scholarships  →  list all scholarships (with optional search/filter)
# ──────────────────────────────────────────────
@router.get("/scholarships", response_model=List[ScholarshipSummary])
def list_scholarships(
    search: Optional[str] = Query(None, description="Search by name or provider"),
    level: Optional[str] = Query(None, description="Filter by education level"),
    type: Optional[str] = Query(None, description="Filter by type"),
    category: Optional[str] = Query(None, description="Filter by eligible category"),
):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        conditions = []
        params = []

        if search:
            conditions.append("(scholarship_name LIKE %s OR provider LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        if level:
            conditions.append("level LIKE %s")
            params.append(f"%{level}%")

        if type:
            conditions.append("type LIKE %s")
            params.append(f"%{type}%")

        if category:
            conditions.append("eligible_categories LIKE %s")
            params.append(f"%{category}%")

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        query = f"""
            SELECT scholarship_id, scholarship_name, provider, type, level,
                   eligible_categories, domicile_requirement, income_limit,
                   scholarship_amount, application_period, official_portal
            FROM scholarships
            {where}
            ORDER BY scholarship_name ASC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [row_to_summary(r) for r in rows]
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/recommend  →  smart filter based on profile
# ──────────────────────────────────────────────
@router.post("/recommend", response_model=List[ScholarshipSummary])
def recommend(req: RecommendationRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        conditions = []
        params = []

        # Education level filter (matches against 'level' column)
        if req.education_level and req.education_level.upper() != "ALL":
            level_map = {
                "10th": ["10th", "Matric", "Class 10"],
                "12th": ["12th", "Intermediate", "Class 12", "Plus Two"],
                "undergraduate": ["Undergraduate", "UG", "Degree", "B.Tech", "B.E.", "B.Sc", "B.Com", "B.A"],
                "postgraduate": ["Postgraduate", "PG", "M.Tech", "M.E.", "M.Sc", "M.Com", "M.A", "MBA"],
                "phd": ["PhD", "Doctorate", "Research"],
            }
            keywords = level_map.get(req.education_level.lower(), [req.education_level])
            level_conditions = " OR ".join(["level LIKE %s"] * len(keywords))
            conditions.append(f"({level_conditions})")
            params.extend([f"%{kw}%" for kw in keywords])

        # State / domicile filter
        if req.state and req.state.upper() != "ALL":
            conditions.append(
                "(domicile_requirement IS NULL OR domicile_requirement = '' "
                "OR domicile_requirement LIKE %s OR domicile_requirement LIKE 'All%' "
                "OR domicile_requirement LIKE 'National%')"
            )
            params.append(f"%{req.state}%")

        # Caste / category filter
        if req.caste and req.caste.upper() != "ALL":
            conditions.append(
                "(eligible_categories IS NULL OR eligible_categories = '' "
                "OR eligible_categories LIKE %s OR eligible_categories LIKE '%All%')"
            )
            params.append(f"%{req.caste}%")

        # Income filter against income_limit text field
        if req.annual_income > 0:
            # We do a best-effort text search; if income_limit is empty treat as open
            conditions.append(
                "(income_limit IS NULL OR income_limit = '' OR income_limit LIKE '%No%' "
                "OR income_limit LIKE '%no limit%')"
            )

        # Stream filter
        if req.stream and req.stream.upper() != "ALL":
            conditions.append(
                "(eligible_courses IS NULL OR eligible_courses = '' "
                "OR eligible_courses LIKE %s OR eligible_courses LIKE '%All%')"
            )
            params.append(f"%{req.stream}%")

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        query = f"""
            SELECT scholarship_id, scholarship_name, provider, type, level,
                   eligible_categories, domicile_requirement, income_limit,
                   scholarship_amount, application_period, official_portal
            FROM scholarships
            {where}
            ORDER BY scholarship_name ASC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [row_to_summary(r) for r in rows]

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ──────────────────────────────────────────────
# GET /api/scholarships/{id}  →  full detail
# ──────────────────────────────────────────────
@router.get("/scholarships/{scholarship_id}", response_model=ScholarshipDetail)
def get_scholarship(scholarship_id: str):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM scholarships WHERE scholarship_id = %s",
            (scholarship_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Scholarship not found")
        return row_to_detail(row)
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# GET /api/stats  →  summary stats for the dashboard
# ──────────────────────────────────────────────
@router.get("/stats")
def get_stats():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS total FROM scholarships")
        total = cursor.fetchone()["total"]
        cursor.execute("SELECT COUNT(DISTINCT type) AS types FROM scholarships WHERE type IS NOT NULL")
        types = cursor.fetchone()["types"]
        cursor.execute("SELECT COUNT(DISTINCT provider) AS providers FROM scholarships WHERE provider IS NOT NULL")
        providers = cursor.fetchone()["providers"]
        cursor.close()
        conn.close()
        return {"total_scholarships": total, "types": types, "providers": providers}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
