import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import db from "./config/database.js";
import path from "path";

import UserRoutes from "./routes/UserRoute.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/files", express.static(path.join(process.cwd(), "public/files")));
app.use(fileUpload());

app.use("/api/user", UserRoutes);

try {
  await db.authenticate();
  console.log("✅ MySQL connected Sucessfully");
  await db.sync();
} catch (err) {
  console.error("❌ DB connection error:", err);
}

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0",() => console.log(`Server running on port ${PORT}`));