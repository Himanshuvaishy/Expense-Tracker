import express from 'express';
import { setBudget,getBudgets ,getBudgetStatus} from '../Controllers/budgetControllers.js';
import  protect  from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/setBudget', protect, setBudget);
router.get('/getBudgets', protect, getBudgets);
router.get('/status', protect, getBudgetStatus);

export default router;
