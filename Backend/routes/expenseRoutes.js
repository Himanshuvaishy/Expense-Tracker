import express from 'express';
import { createExpense,getExpenses,updateExpense,deleteExpense } from '../Controllers/expenseControllers.js';
import protect from '../middlewares/authMiddleware.js';
const router = express.Router();


router.post('/createExpense', protect, createExpense);
router.get('/getExpenses', protect, getExpenses);
router.put('/updateExpense/:id', protect, updateExpense);
router.delete('/deleteExpense/:id', protect, deleteExpense);

export default router;