import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import morgan from "morgan";

dotenv.config({
  path: "./.env",
});

app.use(morgan("tiny"));

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("ERROR While connecting to Database: ", error);
  });
