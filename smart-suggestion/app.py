from flask import Flask, request, jsonify
from flask_cors import CORS
from models import MonthlyReport, Session
from utils.update_or_create_monthly_report import update_or_create_monthly_report  # ✅ Import your updater

app = Flask(__name__)
CORS(app)

# Dummy suggestion logic
suggestion_map = {
    "food": ["🍕 Try cooking at home", "🛒 Use coupons for groceries"],
    "travel": ["🚇 Try public transport", "🛏️ Book in advance"],
    "entertainment": ["🎬 Cheaper streaming options", "🎮 Limit in-app purchases"],
    "rent": ["📉 Negotiate rent", "💡 Save on utilities"],
    "others": ["🧾 Track receipts", "📊 Set spending limits"]
}

@app.route("/")
def home():
    return "Smart Suggestion API is running."

# ✅ Suggestion route
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

# ✅ Save Monthly Report (manual method — legacy)
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
            user_id=user_id,
            month=month,
            year=year
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
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

# ✅ Get last 3 monthly reports
@app.route("/api/reports/<user_id>", methods=["GET"])
def get_reports(user_id):
    session = Session()
    try:
        reports = (
            session.query(MonthlyReport)
            .filter(MonthlyReport.user_id == user_id)
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
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

# ✅ NEW: Automatically update monthly report from utility logic
@app.route("/api/reports/update/<user_id>", methods=["POST"])
def update_report(user_id):
    try:
        update_or_create_monthly_report(user_id)
        return jsonify({"message": "✅ Monthly report updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
