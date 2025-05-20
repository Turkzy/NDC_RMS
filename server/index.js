import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import db from "./config/database.js";
import ConcernRoute from "./routes/ConcernRoute.js";
import yearRoute from "./routes/YearRoute.js"
import monthRoutes from "./routes/MonthRoute.js"
import groupRoutes from "./routes/WorkgroupRoute.js"
import personnelRoutes from "./routes/ItpersonnelRoute.js"
import UserRoute from "./routes/UserRoute.js"
import logsRoutes from "./routes/LogsRoute.js"

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
app.use("/files", express.static("public/"));
app.use(fileUpload());

app.use("/api/concern", ConcernRoute);
app.use("/api/year", yearRoute)
app.use("/api/personnel", personnelRoutes)
app.use("/api/month", monthRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/auth", UserRoute)
app.use("/api/logs", logsRoutes)

try {
  await db.authenticate();
  console.log("✅ MySQL connected Sucessfully");
  await db.sync();
} catch (err) {
  console.error("❌ DB connection error:", err);
}

const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0',() => console.log(`Server running on port ${PORT}`));