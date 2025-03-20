import { Router } from "express";
import {contact_sender} from "../controllers/contact.controller.js";

const router = Router()

router.route("/contact-us-send").post(contact_sender);

export default router