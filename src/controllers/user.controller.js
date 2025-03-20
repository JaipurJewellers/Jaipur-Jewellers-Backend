import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken';
import twilio from 'twilio'
import { OAuth2Client } from 'google-auth-library'
import { sendContactToAdmin } from "./emailServices.js";

// const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
// const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const JWT_SECRET = process.env.JWT_SECRET; // Your JWT secret
const googleClientId = process.env.GOOGLE_CLIENT_ID; // Your Google Client ID
const gpiclient = new OAuth2Client(googleClientId);

export const googleLogin = async (req, res) => {
    const { token } = req.body; // Get the token from the request body

    try {
        // Verify Google token
        const ticket = await gpiclient.verifyIdToken({
            idToken: token,
            audience: googleClientId, // Ensure the client ID matches
        });

        const { email, name, sub: googleId, picture } = ticket.getPayload(); // Extract user info from token

        // Create or update the user in the database
        const user = await User.findOneAndUpdate(
            { googleId }, // Find user by googleId
            { name, email, googleId, picture }, // Update user details
            { new: true, upsert: true } // Create user if not exists
        );

        // Generate JWT token for the user
        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, phone: user.phone },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send the token and user data to the client
        res.status(200).json({
            message: "Google login successful",
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: picture,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ error: "Google authentication failed" });
    }
}

export const signup = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Check if user with the same email or phone number exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(422).json({
                error: existingUser.email === email
                    ? "User with this email already exists"
                    : "User with this phone number already exists",
            });
        }

        // Create and save the new user
        const user = new User({ name, email, phone, password });
        const userResult = await user.save();

        if (userResult) {
            res.status(201).json({ message: "User registered successfully" });
        } else {
            res.status(400).json({ error: "Error registering user" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error during signup" });
    }
}

export const login = async (req, res) => {
    const { identifier, password } = req.body; // Use "identifier" instead of "email"

    try {
        // Check if identifier is an email or a phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier); // Email regex
        const query = isEmail ? { email: identifier } : { phone: identifier }; // Query by email or phone

        const user = await User.findOne(query); // Find user by email or phone
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Check if the password is valid
        const isMatch = await user.isPasswordValid(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }
          
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, phone: user.phone },
            process.env.JWT_SECRET, // Use process.env.JWT_SECRET instead
            { expiresIn: "1h" }
        );
        
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in user" });
        console.log(error);
    }
}

export const forgetPasswordSendOtp = async (req, res) => {
    const { phoneNumber } = req.body; // Extract phone number from the body
    if (!phoneNumber || phoneNumber.length !== 10) {
        return res.status(422).json({ message: "Invalid phone number" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    try {
        const verification = await client.verify.v2
            .services(process.env.TWILIO_AUTH_SERVICES)
            .verifications.create({
                channel: "whatsapp",
                to: "+91" + phoneNumber,
                channelConfiguration: {
                    whatsapp: {
                        enabled: true,
                    },
                },
            });

        return res.status(200).json({ message: "SMS/WhatsApp OTP Sent Successfully", success: true });
    } catch (e) {
        return res.status(404).json({ message: "Error in Sending OTP: " + e });
    }
}

export const forgetPasswordReset = async (req, res) => {
    const { phoneNumber, newPassword } = req.body;

    // Log the incoming request for debugging

    // Validate input
    if (!phoneNumber || !newPassword) {
        return res.status(400).json({ error: "Phone number and new password are required." });
    }

    // Optional: Add password strength validation
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    try {
        // Check if the user with this phone number exists
        const user = await User.findOne({ phone: phoneNumber });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Hash the new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Failed to update password. Please try again." });
    }
}

export const forgetPasswordVerifyOtp = async (req, res) => {
    const { otp, phoneNumber } = req.body; // Extract OTP and phone number from the request body

    if (!phoneNumber || phoneNumber.length !== 10 || !otp || otp.length !== 6) {
        return res.status(422).json({ message: "Invalid Contact/OTP Length." });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    try {
        const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_AUTH_SERVICES)
            .verificationChecks.create({
                code: otp,
                to: "+91" + phoneNumber,
            });

        if (verificationCheck.status === "approved") {
            return res.status(200).json({
                message: "Contact Verified Successfully: ",
                success: true,
            });
        } else {
            return res.status(422).json({ message: "Verification Failed: " });
        }
    } catch (e) {
        return res.status(404).json({ message: "Error in Verifying OTP: " + e.message });
    }
}

export const userContact = async (req, res) => {
    const { name, email, subject } = req.body

    if (!name || !email || !subject) {
        return res.status(422).json({ message: "Please fill all the fields." });
    }

    const MainSubject = `${name} - Mail from website`

    await sendContactToAdmin(email, subject, MainSubject)

    return res
        .status(200)
        .json({
            message: "Mail send successfully: ",
            success: true,
        })

}