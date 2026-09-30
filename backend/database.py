import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Return a new MySQL connection using env config."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "Dharma@123"),
        database=os.getenv("DB_NAME", "scholarship_db"),
        autocommit=True
    )
