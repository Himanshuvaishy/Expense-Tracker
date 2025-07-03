from sqlalchemy import create_engine, Column, Integer, String, Float, Date, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

# ✅ Monthly Report Model
class MonthlyReport(Base):
    __tablename__ = 'monthly_reports'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    month = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    total_spent = Column(Float, default=0.0)
    top_category = Column(String)
    overbudget_categories = Column(String)

    __table_args__ = (
        UniqueConstraint('user_id', 'month', 'year', name='unique_user_month_year'),
    )

    def __repr__(self):
        return f"<MonthlyReport(user_id='{self.user_id}', month='{self.month}', year={self.year})>"


# ✅ Expense Model
class Expense(Base):
    __tablename__ = 'expense'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    category = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    def __repr__(self):
        return f"<Expense(user_id='{self.user_id}', amount={self.amount}, date={self.date})>"


# ✅ Setup SQLite DB (DO NOT auto-create on import)
engine = create_engine('sqlite:///reports.db', echo=False)  # Turn off echo in production
Session = sessionmaker(bind=engine)
