from sqlalchemy import create_engine, Column, Integer, String, Float, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class MonthlyReport(Base):
    __tablename__ = 'monthly_reports'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    month = Column(String, nullable=False)  # e.g. "July"
    year = Column(Integer, nullable=False)
    total_spent = Column(Float, default=0.0)
    top_category = Column(String)
    overbudget_categories = Column(String)

    __table_args__ = (
        UniqueConstraint('user_id', 'month', 'year', name='unique_user_month_year'),
    )

    def __repr__(self):
        return f"<MonthlyReport(user={self.user_id}, month={self.month}, year={self.year}, spent={self.total_spent})>"

# ✅ Setup SQLite DB
engine = create_engine('sqlite:///reports.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

