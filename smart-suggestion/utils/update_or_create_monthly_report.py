from models import MonthlyReport, Session
from datetime import datetime
import requests
import os

# ✅ Read from environment variable with fallback
NODE_API_BASE = os.getenv("NODE_API_BASE", "http://localhost:7777/api")

def update_or_create_monthly_report(user_id):
    month = datetime.now().strftime("%B")
    year = datetime.now().year

    try:
        # ✅ Fetch expenses
        res = requests.get(f"{NODE_API_BASE}/expenses/getExpenses", params={"userId": user_id})
        if res.status_code != 200:
            print("❌ Failed to fetch expenses:", res.text)
            return

        expenses = res.json()
        print(f"📦 {len(expenses)} expenses fetched.")

        # ✅ Filter current month
        current_month_expenses = [
            exp for exp in expenses
            if datetime.strptime(exp['date'], "%Y-%m-%dT%H:%M:%S.%fZ").month == datetime.now().month
        ]

        if not current_month_expenses:
            print("📭 No expenses this month.")
            return

        total_spent = sum(float(e["amount"]) for e in current_month_expenses)

        # ✅ Top category
        category_totals = {}
        for e in current_month_expenses:
            cat = e["category"].strip().lower()
            category_totals[cat] = category_totals.get(cat, 0) + float(e["amount"])
        top_category = max(category_totals, key=category_totals.get)

        # ✅ Fetch budgets
        budget_res = requests.get(f"{NODE_API_BASE}/budget/status", params={"userId": user_id})
        budget_data = budget_res.json() if budget_res.status_code == 200 else []

        overbudget = [b["category"] for b in budget_data if float(b.get("percentage", 0)) >= 100]

        # ✅ Save or update
        session = Session()
        existing = session.query(MonthlyReport).filter_by(
            user_id=user_id,
            month=month,
            year=year
        ).first()

        if existing:
            existing.total_spent = total_spent
            existing.top_category = top_category
            existing.overbudget_categories = ", ".join(overbudget)
        else:
            new_report = MonthlyReport(
                user_id=user_id,
                month=month,
                year=year,
                total_spent=total_spent,
                top_category=top_category,
                overbudget_categories=", ".join(overbudget)
            )
            session.add(new_report)

        session.commit()
        print(f"✅ Report saved/updated for: {user_id}, {month} {year}")

    except Exception as e:
        session.rollback()
        print("❌ Error updating report:", str(e))
    finally:
        session.close()
