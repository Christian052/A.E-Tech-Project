require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const fs = require("fs");

const { connectDB } = require("./config/db");
const logger = require("./config/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const getRouter = (routeModule, name) => {
  const router = routeModule && routeModule.default ? routeModule.default : routeModule;
  if (typeof router !== "function") {
    throw new TypeError(
      `Route '${name}' did not export a valid Express router. ` +
      `Check './routes/${name}.js' and ensure it has 'module.exports = router;' at the bottom.`
    );
  }
  return router;
};

const authRoutes = getRouter(require("./routes/auth"), "auth");
const servicesRoutes = getRouter(require("./routes/services"), "services");
const galleryRoutes = getRouter(require("./routes/gallery"), "gallery");
const trainingProgramsRoutes = getRouter(require("./routes/trainingPrograms"), "trainingPrograms");
const applicationsRoutes = getRouter(require("./routes/applications"), "applications");
const contactRoutes = getRouter(require("./routes/contact"), "contact");
const settingsRoutes = getRouter(require("./routes/settings"), "settings");
const testimonialsRoutes = getRouter(require("./routes/testimonials"), "testimonials");
const usersRoutes = getRouter(require("./routes/users"), "users");

const app = express();

// Set up allowed origins without trailing slashes
const rawOrigin = process.env.CORS_ORIGIN || "https://augusmart.vercel.app";
const allowedOrigins = rawOrigin.split(",").map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server or mobile apps)
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Configure Helmet to allow cross-origin fetching of static images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// --- DUAL-PATH STATIC UPLOADS SERVING ---
const uploadsPathPrimary = path.join(__dirname, "uploads");
const uploadsPathFallback = path.join(__dirname, "..", "uploads");

app.use("/uploads", express.static(uploadsPathPrimary));
app.use("/uploads", express.static(uploadsPathFallback));

// Debug logger for 404 images
app.use("/uploads/*", (req, res) => {
  console.log(`❌ [404 Image Not Found]: Request path "${req.originalUrl}" did not match files in ${uploadsPathPrimary}`);
  res.status(404).send("Image file not found on server.");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/training-programs", trainingProgramsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/contact", contactRoutes); 
app.use("/api/settings", settingsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/users", usersRoutes); 

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`[server] AUGU SMART ELECTRONIC SERVICE API listening on port ${PORT}`);
  });
}

start();

module.exports = app;