
# Expense Tracker
#  Personal Expense Tracker with Smart Suggestions

This is a full-stack web application to **track personal expenses**, analyze spending patterns, set budgets, and receive **AI-powered smart saving suggestions**. Built using **React.js**, **Node.js**, **Python Flask**, **MongoDB**, and **SQLite**.

---

##  Features

###  Expense Management
- Add, edit, delete daily expenses
- Filter by date, category, payment method
- View top payment method usage

###  Dashboard Analytics
- Visual charts: Pie, Bar, and Line (Chart.js)
- Monthly spending summary
- Top category + daily trend analysis

###  Budget Management
- Set category-wise monthly budgets
- View budget vs. actual spent
- Inline editing of budgets

###  Smart Suggestions (Python + Flask)
- AI-like savings tips based on:
  - Category (e.g., food, rent, travel)
  - Monthly spending amount
- Tips dynamically change per user



###  Authentication
- Register/Login system with session persistence
- User-specific dashboards and reports

---

## 🛠️ Tech Stack
MERN Stack

---

## 📁 Folder Structure
root --- 📁Expense Tracker
       -- Frontend
       ---Backend
       --Smart suggestion

## 🌐 Live Links
🌍 Frontend   | https://personalexpensetrack.netlify.app/ |
🔗 Node API   | https://expense-tracker-1yf7.onrender.com/api |
| 🧠 Python API | https://expense-tracker-1-03il.onrender.com/api | 


### Prerequisites
- Node.js
- Python 3.8+
- MongoDB Atlas (for production)

### 1. Clone repo
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

###  Install Node backend (core API)
cd node-api
npm install
npm run dev

 ###Setup Python Flask backend

cd smart-suggestion
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate (Linux/macOS)
pip install -r requirements.txt
python init_db.py     # ✅ creates reports.db
python app.py

## Start React frontend

cd client
npm install
npm run dev



🙋‍♂️ Author
Himanshu
Email: vaishhimanshu83170@gmail.com
GitHub: https://github.com/Himanshuvaishy


