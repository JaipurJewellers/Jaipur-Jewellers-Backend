import mongoose from "mongoose";

const blogsSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
},
    {
        timestamps: true
    }
);

export const Blog = mongoose.model("Blog", blogsSchema)
