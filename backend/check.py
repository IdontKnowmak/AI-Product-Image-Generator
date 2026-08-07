import os
from dotenv import load_dotenv
import psycopg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:")
print(DATABASE_URL)

try:
    conn = psycopg.connect(DATABASE_URL)
    print("✅ Neon PostgreSQL Connected!")
    conn.close()
except Exception as e:
    print("❌ Connection Failed")
    print(e)