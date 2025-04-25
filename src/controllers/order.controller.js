import { Order } from "../model/order.model.js";
import { processPayment, verifyPayments } from "../utils/phonepe.js";


export const createOrder = async (req, res) => {
    try {
        const { userId, cartItems = [], shippingInfo, totalPrice, transactionId } = req.body;

        const response = await processPayment(req.body, 'http://localhost:5173/order-confirm/')

        if (response.redirectUrl) {
            // Create the order
            const newOrder = new Order({
                user: userId,
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingInfo,
                transactionId,
                amount: totalPrice,
                createdAt: new Date(),
            });

            // Save the order to the database
            await newOrder.save();
            res.status(201).json(response);
        }
        else {
            res.status(400).json({ message: "Payment initiation failed", error: response.error });
        }
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


export const verifyPayment = async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ message: "Transaction ID is required" });
        }
        const response = await verifyPayments(transactionId)

        if (response.data.state === "COMPLETED") {
            const order = await Order.findOne({ transactionId });

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            order.status = "paid";
            await order.save();

            res.status(200).json({ message: "Payment verified successfully", order });
        }

    } catch (error) {
        console.error("Error verifying payment:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find();  // You can also filter based on user, e.g., Order.find({ user: req.user._id });
        res.status(200).json({ message: orders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}


export const deleteAllOrders = async (req, res) => {
    try {
        await Order.deleteMany(); // Deletes all orders
        res.status(200).json({ message: "All orders have been deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting orders", error: error.message });
    }
};
