from sqlalchemy import create_engine, Column, Integer, String, Float, Date, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

# ✅ Monthly Report Model
class MonthlyReport(Base):
    __tablename__ = 'monthly_reports'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    month = Column(String, nullable=False)  # e.g., "July"
    year = Column(Integer, nullable=False)
    total_spent = Column(Float, default=0.0)
    top_category = Column(String)
    overbudget_categories = Column(String)

    __table_args__ = (
        UniqueConstraint('user_id', 'month', 'year', name='unique_user_month_year'),
    )


# ✅ Expense Model (MISSING EARLIER)
class Expense(Base):
    __tablename__ = 'expense'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    category = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)


# ✅ Setup SQLite DB
engine = create_engine('sqlite:///reports.db', echo=True)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
