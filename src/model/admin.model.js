import bcrypt from 'bcryptjs'
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

adminSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

adminSchema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema)