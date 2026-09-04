import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

#def get_db_connection():
#    conn = mysql.connector.connect(
#        host=os.getenv("DB_HOST", "localhost"),
#        port=int(os.getenv("DB_PORT", 3306)),
#        user=os.getenv("DB_USER", "root"),
#        password=os.getenv("DB_PASSWORD", "1114"),
#        database=os.getenv("DB_NAME", "mathsy_db"),
#        connection_timeout=10
#     )

def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST") or os.getenv("MYSQLHOST") or "localhost",
        port=int(os.getenv("DB_PORT") or os.getenv("MYSQLPORT") or 3306),
        user=os.getenv("DB_USER") or os.getenv("MYSQLUSER") or "root",
        password=os.getenv("DB_PASSWORD") or os.getenv("MYSQLPASSWORD") or "0627",
        database=os.getenv("DB_NAME") or os.getenv("MYSQLDATABASE") or "mathsy_db",
        connection_timeout=10
    )

    cursor = conn.cursor()
    cursor.execute("SET time_zone = '+08:00'")
    cursor.close()

    return conn