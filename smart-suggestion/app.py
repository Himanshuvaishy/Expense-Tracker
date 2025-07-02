from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# Dummy logic: map categories to suggestions
suggestion_map = {
    "food": ["🍕 Try cooking at home", "🛒 Use coupons for groceries"],
    "travel": ["🚇 Try public transport", "🛏️ Book in advance"],
    "entertainment": ["🎬 Consider cheaper streaming options", "🎮 Limit in-app purchases"],
    "rent": ["📉 Negotiate rent", "💡 Save on utilities"],
    "others": ["🧾 Track receipts", "📊 Set spending limits"]
}

@app.route("/")
def home():
    return "Smart Suggestion API is running."

@app.route("/api/suggest", methods=["POST"])
def suggest():
    data = request.json
    category = data.get("category", "").strip().lower()

    try:
        # ✅ Ensure amount is a number
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
