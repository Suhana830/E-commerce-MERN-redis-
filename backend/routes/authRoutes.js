import express from 'express'
import { getProfile, login, logout, refreshToken, signup } from '../controllers.js/authController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)

//refresh the access token
router.post("/refresh-token", refreshToken);

router.get("/profile", protectRoute, getProfile)


export default router;