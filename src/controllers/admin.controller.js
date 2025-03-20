import { Admin } from "../model/admin.model.js";
import jwt from 'jsonwebtoken'
import { Blog } from "../model/blogs.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//this logic is to add admin credentials to backend
export const addAdmin = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" })
    }

    const admin = await Admin.create({
        email,
        password
    })

    if (!admin) {
        return res.status(500).json({ error: "Failed to add admin" })
    }

    return res.status(200).json({ message: "Admin added successfully" })

}

// this logic is to login admin
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" })
    }

    const user = await Admin.findOne({ email })

    if (!user) {
        return res.status(404).json({ error: "Admin does not Found" })
    }

    const isPasswordCorrect = await user.isPasswordValid(password)

    if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid Password" })
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    return res
        .status(200)
        .json({ message: "Authentication Complete", token, id: user._id });
}

export const addBlog = async (req, res) => {
    const { blogTitle, blogContent } = req.body

    if (!blogTitle || !blogContent || !req.files.image) {
        return res.status(401).json({ error: "Title, Category, tag and Image is required" })
    }
    const image = await uploadOnCloudinary(req.files.image[0].path)

    const blog = await Blog.create({
        title: blogTitle,
        content: blogContent,
        image: image.secure_url,
    })

    if (!blog) {
        return res.status(401).json({ error: "Blog not founded" })
    }

    return res
        .status(200)
        .json({ message: "blog created successfully" });
}

// this is to get all blogs
export const getBlogs = async (req, res) => {
    const blog = await Blog.find()

    if (!blog) {
        return res.status(401).json({ error: "Blogs not founded" })
    }

    return res
        .status(200)
        .json({ message: blog });
}

// to delete all blogs
export const deleteAllBlogs = async (req, res) => {
    const blog = await Blog.deleteMany()

    if (!blog) {
        return res.status(401).json({ error: "Blogs not founded" })
    }

    return res
        .status(200)
        .json({ message: "all deleted" });
}

// this is to get single blog
export const getSingleBlog = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(401).json({ error: "Id not founded" })
    }

    const blog = await Blog.findById(
        id
    )

    if (!blog) {
        return res.status(401).json({ error: "Blogs not founded" })
    }

    return res
        .status(200)
        .json({ message: blog });
}

// this is to delete single blog
export const deleteSingleBlog = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(401).json({ error: "Id not founded" })
    }

    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
        return res.status(401).json({ error: "Blogs not founded" })
    }

    return res
        .status(200)
        .json({ message: "Blog deleted Successfully" });
}