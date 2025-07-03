from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from models import MonthlyReport, Session, Base, engine  # ✅ Add Base and engine
from dateutil.parser import parse as parse_date
import os

app = Flask(__name__)

# ✅ Create DB tables if they don’t exist
Base.metadata.create_all(bind=engine)

# ✅ Debug: Show NODE_API_BASE
print("🔧 Using NODE_API_BASE:", os.getenv("NODE_API_BASE"))

# ✅ CORS setup
CORS(app,
     supports_credentials=True,
     origins=[
         "http://localhost:5173",
         "https://personalexpensetrack.netlify.app"
     ],
     allow_headers=["Content-Type", "Authorization"])

# 🔍 Suggestion logic
suggestion_map = {
    "food": ["🍕 Try cooking at home", "🛒 Use coupons for groceries"],
    "travel": ["🚇 Try public transport", "🛏️ Book in advance"],
    "entertainment": ["🎬 Cheaper streaming options", "🎮 Limit in-app purchases"],
    "rent": ["📉 Negotiate rent", "💡 Save on utilities"],
    "others": ["🧾 Track receipts", "📊 Set spending limits"]
}


@app.route("/")
def home():
    return "Smart Suggestion API is running ✅"


@app.route("/api/suggest", methods=["POST"])
def suggest():
    data = request.json
    category = data.get("category", "").strip().lower()
    try:
        amount = float(data.get("amount", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a number"}), 400

    if not category or amount <= 0:
        return jsonify({"error": "Category and valid amount required"}), 400

    suggestions = suggestion_map.get(category, suggestion_map["others"])
    return jsonify({
        "category": category,
        "amount": amount,
        "suggestions": suggestions
    })


@app.route("/api/save-report", methods=["POST"])
def save_report():
    data = request.json
    user_id = data.get("user_id")
    month = data.get("month")
    year = data.get("year")
    total_spent = data.get("total_spent")
    top_category = data.get("top_category", "")
    overbudget = ", ".join(data.get("overbudget_categories", []))

    if not user_id or not month or not year:
        return jsonify({"error": "Missing required fields"}), 400

    session = Session()
    try:
        existing = session.query(MonthlyReport).filter_by(
            user_id=user_id, month=month, year=year
        ).first()

        if existing:
            return jsonify({"message": "✅ Report already exists"}), 200

        report = MonthlyReport(
            user_id=user_id,
            month=month,
            year=year,
            total_spent=total_spent,
            top_category=top_category,
            overbudget_categories=overbudget
        )
        session.add(report)
        session.commit()
        return jsonify({"message": "✅ Monthly report saved successfully"}), 201
    except Exception as e:
        session.rollback()
        print("❌ Error saving report:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


@app.route("/api/reports/<user_id>", methods=["GET"])
def get_reports(user_id):
    session = Session()
    try:
        print("📥 Fetching reports for user_id:", user_id)
        reports = (
            session.query(MonthlyReport)
            .filter(MonthlyReport.user_id == user_id.strip())
            .order_by(MonthlyReport.year.desc(), MonthlyReport.month.desc())
            .limit(3)
            .all()
        )

        result = [
            {
                "month": r.month,
                "year": r.year,
                "total_spent": r.total_spent,
                "top_category": r.top_category,
                "overbudget_categories": r.overbudget_categories or "None"
            }
            for r in reports
        ]
        return jsonify(result)
    except Exception as e:
        print("❌ Error in /api/reports:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    month = request.args.get("month")
    year = request.args.get("year")
    user_id = request.args.get("user_id")

    print("📥 Received query:", {"month": month, "year": year, "user_id": user_id})

    if not month or not year or not user_id:
        return jsonify({"error": "Month, year, and user_id are required"}), 400

    session = Session()
    try:
        formatted_month = str(month).zfill(2)

        expenses = session.execute(
            text("""
                SELECT category, payment_method, date, amount 
                FROM expense 
                WHERE user_id = :user_id 
                AND strftime('%m', date) = :month 
                AND strftime('%Y', date) = :year
            """),
            {"user_id": user_id.strip(), "month": formatted_month, "year": str(year)}
        ).fetchall()

        print(f"📊 {len(expenses)} expenses fetched for user {user_id}.")

        total_spent = sum([e.amount for e in expenses])
        spending_by_category = {}
        payment_methods = {}
        spending_over_time = {}

        for e in expenses:
            spending_by_category[e.category] = spending_by_category.get(e.category, 0) + e.amount
            payment_methods[e.payment_method] = payment_methods.get(e.payment_method, 0) + e.amount
            date_str = parse_date(e.date).strftime("%Y-%m-%d")
            spending_over_time[date_str] = spending_over_time.get(date_str, 0) + e.amount

        top_category = max(spending_by_category.items(), key=lambda x: x[1])[0] if spending_by_category else ""

        return jsonify({
            "totalSpent": total_spent,
            "topCategory": top_category,
            "topPaymentMethods": [{"method": k, "amount": v} for k, v in payment_methods.items()],
            "spendingByCategory": [{"category": k, "amount": v} for k, v in spending_by_category.items()],
            "spendingOverTime": [{"date": k, "amount": v} for k, v in sorted(spending_over_time.items())],
            "overbudgetCategories": []
        })
    except Exception as e:
        print("❌ Error in dashboard summary:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


# ✅ Run app if main
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))  # support for Render, uses $PORT
    app.run(debug=True, host="0.0.0.0", port=port)
