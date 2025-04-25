import { Router } from "express";
import { createOrder, deleteAllOrders, getOrderHistory, verifyPayment } from "../controllers/order.controller.js";

const router = Router()

router.route("/create-order").post(createOrder)

router.route("/verify-order").post(verifyPayment)


router.route("/order-history").post(getOrderHistory)

router.route("/delete-order-history").post(deleteAllOrders)


export default router