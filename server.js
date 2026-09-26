require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./Backend/src/config/db");

// Import route handlers
const authRoutes = require("./Backend/src/routes/auth");
const servicesRoutes = require("./Backend/src/routes/services");
const galleryRoutes = require("./Backend/src/routes/gallery");
const trainingProgramsRoutes = require("./Backend/src/routes/trainingPrograms");
const applicationsRoutes = require("./Backend/src/routes/applications");
const contactRoutes = require("./Backend/src/routes/contact");
const settingsRoutes = require("./Backend/src/routes/settings");
const testimonialsRoutes = require("./Backend/src/routes/testimonials");
const usersRoutes = require("./Backend/src/routes/Users");
const uploadRoutes = require("./Backend/src/routes/upload");
const { errorHandler } = require("./Backend/src/middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Static uploads folders
const uploadsPathPrimary = path.join(__dirname, "Backend", "uploads");
const uploadsPathPublic = path.join(__dirname, "Frontend", "public");
app.use("/uploads", express.static(uploadsPathPrimary));
app.use("/uploads", express.static(uploadsPathPublic));
app.use(express.static(uploadsPathPublic));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/training-programs", trainingProgramsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/upload", uploadRoutes);

// Error handler for API routes
app.use("/api", (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});
app.use(errorHandler);

async function startServer() {
  await connectDB();

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.resolve(__dirname, "Frontend"),
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3000,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // SPA fallback in development mode
    app.use("*", async (req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) return next();
      try {
        const fs = require("fs");
        let template = fs.readFileSync(path.resolve(__dirname, "Frontend", "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        if (vite.ssrFixStacktrace) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "Frontend", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] AUGU SMART ELECTRONIC SERVICE running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

module.exports = app;
