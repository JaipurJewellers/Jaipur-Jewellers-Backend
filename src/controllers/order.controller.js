import { Order } from "../model/order.model.js";


export const createOrder = async (req, res) => {
    try {
        const { userId, cartItems = [], shippingInfo, totalPrice } = req.body;

        // Create the order
        const newOrder = new Order({
            user: userId,
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingInfo,
            amount: totalPrice,
            createdAt: new Date(),
        });
        
        // Save the order to the database
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error.message);
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
