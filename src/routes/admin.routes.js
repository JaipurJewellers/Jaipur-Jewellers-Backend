import { Router } from "express";
import { addAdmin, addBlog, deleteAllBlogs, deleteSingleBlog, getBlogs, getSingleBlog, login } from "../controllers/admin.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/add-admin").post(addAdmin)
router.route("/admin-login").post(login)
router.route("/create-blog").post(upload.fields([{ name: "image", maxCount: 1 }]), addBlog)
router.route("/get-blogs").post(getBlogs)
router.route("/delete-blogs").post(deleteAllBlogs)
router.route("/get-single-blog").post(getSingleBlog)
router.route("/delete-single-blog").post(deleteSingleBlog)

export default router;