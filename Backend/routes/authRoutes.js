import express from 'express';
import { registerUser,loginUser,getUserCount } from '../Controllers/auth.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/usercount", getUserCount);

export default router;