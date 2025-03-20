import Router from 'express'
import { forgetPasswordReset, forgetPasswordSendOtp, forgetPasswordVerifyOtp, login, signup, userContact } from '../controllers/user.controller.js';

const router = Router()

router.route("/signup").post(signup)

// Login route
router.route("/login").post(login)

// Route to send OTP to user's phone number
router.route("/forgot-password/send-otp").post(forgetPasswordSendOtp)

router.route("/forgot-password/reset-password").post(forgetPasswordReset)

// Route to verify OTP
router.route("/forgot-password/verify-otp").post(forgetPasswordVerifyOtp)

router.route("/send-mail").post(userContact)


export default router