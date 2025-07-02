import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from './routes/dashboardRoutes.js';
import expenseRoutes from "./routes/expenseRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cookieParser());
const allowedOrigins = [
  process.env.FRONTEND_URL,       // production frontend (e.g., https://your-frontend.vercel.app)
  "http://localhost:5173"         // local frontend dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budget", budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    //* DB ready then server starts
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(" Failed to connect to database:", err.message);
    process.exit(1);
  }
};

startServer();
