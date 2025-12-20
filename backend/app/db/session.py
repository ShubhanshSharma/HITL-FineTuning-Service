from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

print("database url:", DATABASE_URL)
engine = create_engine(
    DATABASE_URL,
    future=True,
)

session_local = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)