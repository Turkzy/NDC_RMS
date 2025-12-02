import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import db from "./config/database.js";
import path from "path";

//IMPORT FOR EACH ROUTES
import UserRoutes from "./routes/UserRoutes.js";
import ConcernRoutes from "./routes/ConcernRoutes.js";
import RbacRoutes from "./routes/RbacRoutes.js";
import ItemsRoutes from "./routes/Dropdown/ItemsRoutes.js"
import LocationRoutes from "./routes/Dropdown/LocationRoutes.js";
import RemarksRoutes from "./routes/RemarksRoutes.js";

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
app.use("/concernfiles", express.static(path.join(process.cwd(), "public/concernfiles")));
app.use(fileUpload());

app.use("/api/user", UserRoutes);
app.use("/api/rbac", RbacRoutes);
app.use("/api/concerns", ConcernRoutes);
app.use("/api/items", ItemsRoutes);
app.use("/api/locations", LocationRoutes);
app.use("/api/remarks", RemarksRoutes);

try {
  await db.authenticate();
  console.log("✅ MySQL connected Successfully");
  await db.sync();
} catch (err) {
  console.error("❌ DB connection error:", err);
}

const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));