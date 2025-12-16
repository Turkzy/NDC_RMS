import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import db from "./config/database.js";
import path from "path";


//IMPORT FOR EACH ROUTES
import UserRoutes from "./routes/UserRoutes.js";
import ConcernRoutes from "./routes/ConcernRoutes.js";
import RbacRoutes from "./routes/RbacRoutes.js";
import ItemsRoutes from "./routes/Dropdown/ItemsRoutes.js";
import LocationRoutes from "./routes/Dropdown/LocationRoutes.js";
import RemarksRoutes from "./routes/RemarksRoutes.js";
import ActionLogsRoutes from "./routes/ActionLogsRoutes.js";

dotenv.config();

const app = express();

// Security headers - should be first (after app initialization)
// Helmet helps secure Express apps by setting various HTTP headers
// Note: HSTS disabled for HTTP-only deployment (htdocs)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://192.168.1.102:5002", "http://localhost:*"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
  hsts: false // Disabled for HTTP-only deployment
}));


// Body parsing
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Cookie parser - must be before routes
app.use(cookieParser());

// CORS configuration
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowed.length ? allowed : true, // Allow all origins if none specified (for development)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware to add CORS headers to static file responses
const staticCorsMiddleware = (req, res, next) => {
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (origin && (allowed.length === 0 || allowed.includes(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (allowed.length === 0) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  
  // Add CORS headers to actual requests
  const origin = req.headers.origin;
  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (allowed.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};

// Static file serving with CORS middleware
app.use("/files", staticCorsMiddleware, express.static(path.join(process.cwd(), "public/files")));
app.use(
  "/concernfiles",
  staticCorsMiddleware,
  express.static(path.join(process.cwd(), "public/concernfiles"))
);
app.use(
  "/userimages",
  staticCorsMiddleware,
  express.static(path.join(process.cwd(), "public/userimages"))
);

// File upload
app.use(fileUpload());
app.use("/api/user", UserRoutes);
app.use("/api/rbac", RbacRoutes);
app.use("/api/concerns", ConcernRoutes);
app.use("/api/items", ItemsRoutes);
app.use("/api/locations", LocationRoutes);
app.use("/api/remarks", RemarksRoutes);
app.use("/api/action-logs", ActionLogsRoutes);

try {
  await db.authenticate();
  console.log("✅ MySQL connected Successfully");
  await db.sync();
} catch (err) {
  console.error("❌ DB connection error:", err);
}

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
