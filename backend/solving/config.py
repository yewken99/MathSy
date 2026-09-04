import os
import re
import mysql.connector
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# 1. API CLIENTS
# ==========================================
aclient = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "mathsy-rag"))

RAG_NAMESPACE = os.getenv(
    "PINECONE_QUESTION_NAMESPACE",
    os.getenv("PINECONE_NAMESPACE", "spm_trial_questions")
)

# ==========================================
# 2. DATABASE CONFIG
# ==========================================
def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST") or os.getenv("MYSQLHOST") or "localhost",
        port=int(os.getenv("DB_PORT") or os.getenv("MYSQLPORT") or 3306),
        user=os.getenv("DB_USER") or os.getenv("MYSQLUSER") or "root",
        password=os.getenv("DB_PASSWORD") or os.getenv("MYSQLPASSWORD") or "0627",
        database=os.getenv("DB_NAME") or os.getenv("MYSQLDATABASE") or "mathsy_db",
        connection_timeout=10
    )
    
    return conn

# ==========================================
# 3. THRESHOLDS & GLOBALS
# ==========================================
EXACT_MATCH_THRESHOLD = 0.9
STAGE_HIGH_THRESHOLD = 0.79
STAGE_MEDIUM_THRESHOLD = 0.68

# ==========================================
# 4. SYLLABUS MAPPING
# ==========================================
SPM_SYLLABUS_MAPPING = {
    "Logical Reasoning":["Statements", "Arguments"],
    "Numbers and Arithmetic": ["Rational Numbers", "Factors and Multiples", "Squares, Square Roots, Cubes", "Standard Form", "Indices", "Number Bases"],
    "Algebra": ["Algebraic Expressions", "Algebraic Formulae", "Expansion and Factorisation", "Algebraic Fractions"],
    "Equations and Inequalities": ["Linear Equations", "Simultaneous Equations", "Linear Inequalities", "Quadratic Equations"],
    "Functions and Graphs": ["Functions", "Graphs of Functions", "Quadratic Functions", "Graphs of Motion", "Gradient of Straight Line"],
    "Sequences and Patterns": ["Patterns", "Sequences"],
    "Geometry": ["Lines and Angles", "Polygons", "Circles", "Angles and Tangents of Circles", "Loci in Two Dimensions"],
    "Mensuration": ["Perimeter and Area", "Surface Area", "Volume of Solids"],
    "Trigonometry": ["Trigonometric Ratios", "Trigonometric Graphs"],
    "Transformations": ["Translation", "Reflection", "Rotation", "Enlargement", "Combined Transformations", "Symmetry"],
    "Coordinate Geometry": ["Cartesian Coordinate System", "Distance", "Midpoint", "Straight Lines"],
    "3D Geometry": ["Three-Dimensional Shapes", "Plans and Elevations", "Geometric Properties of 3D Shapes"],
    "Statistics": ["Data Handling", "Measures of Central Tendency", "Measures of Dispersion"],
    "Probability": ["Simple Probability", "Combined Events"],
    "Sets and Logic": ["Sets", "Logical Reasoning"],
    "Graph Theory": ["Network in Graph Theory"],
    "Financial Mathematics": ["Savings and Investments", "Credit and Debt", "Insurance", "Taxation"],
    "Variation": ["Direct Variation", "Inverse Variation", "Combined Variation"],
    "Matrices": ["Matrices", "Matrix Operations"],
    "Mathematical Modeling": ["Mathematical Modeling"],
    "Rates and Motion": ["Speed", "Acceleration"]
}

def canonical_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip()).lower()

TOPIC_LOOKUP = {canonical_text(topic): topic for topic in SPM_SYLLABUS_MAPPING.keys()}
SUBTOPIC_TO_TOPIC = {}
for topic, subtopics in SPM_SYLLABUS_MAPPING.items():
    for subtopic in subtopics:
        SUBTOPIC_TO_TOPIC[canonical_text(subtopic)] = {"topic": topic, "subtopic": subtopic}

# ==========================================
# 5. LANGUAGE HELPERS
# ==========================================
def normalize_response_language(language):
    lang = str(language or "english").strip().lower()
    if lang in ["bm", "malay", "bahasa melayu", "bahasa_melayu"]:
        return "bm"
    return "english"


def get_response_language_rules(language):
    lang = normalize_response_language(language)

    if lang == "bm":
        return """
LANGUAGE RULES:
- The student's selected system language is Bahasa Melayu.
- Return ALL explanation text, step titles, reasons, final answers, and common mistakes in Bahasa Melayu only.
- If the official marking scheme contains English, translate it into Bahasa Melayu.
- Do not mix English unless it is a fixed mathematical term, formula, variable name, or copied from the question.
- The "math" field must contain only mathematical expressions/equations.
- If the answer is a word or sentence, put it in "text", not "math".
""".strip()

    return """
LANGUAGE RULES:
- The student's selected system language is English.
- Return ALL explanation text, step titles, reasons, final answers, and common mistakes in English only.
- If the official marking scheme contains Bahasa Melayu, translate it into English.
- Do not mix Bahasa Melayu unless it is copied from the question.
- The "math" field must contain only mathematical expressions/equations.
- If the answer is a word or sentence, put it in "text", not "math".
""".strip()