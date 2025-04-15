import express from "express";
import cors from "cors";
const app = express();

const allowedOrigins = [
  "https://jaipur-jwellers-frontend.vercel.app",
  "https://jaipur-jewellers-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:8000",
  "https://jaipurjeweller.com",
  "https://www.jaipurjeweller.com",
  "https://jaipur-jewellers-backend.vercel.app",
  "https://jaipur-jewellers-backend.onrender.com"
]; // Add any other origins you need

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If the origin isn't in the allowed list
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true, // if your frontend needs to send cookies
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.status(200).send("OK"); // Health check endpoint
});

//import router here
import userRouter from "./routes/user.routes.js";
import orderRouter from "./routes/order.routes.js";
import productRouter from "./routes/product.routes.js";
import adminRouter from "./routes/admin.routes.js";
import contactRoute from "./routes/contact.routes.js";
import favoriteRoute from "./routes/favorite.routes.js"

app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/favorites", favoriteRoute);

export default app;
