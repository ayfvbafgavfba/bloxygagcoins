/** @format */

const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const hpp = require("hpp");
const cors = require("cors");
const socket = require("socket.io");

// Load application config
require("dotenv").config({ path: "./config/config.env" });

// Init express app & create http server
const app = express();
const server = http.createServer(app);

// Create allowed frontend origins array for CORS
const frontendOrigins = process.env.SERVER_FRONTEND_URL
  ? process.env.SERVER_FRONTEND_URL.split(",").map((url) => url.trim())
  : [];

// Create socket server
const io = socket(server, {
  transports: ["websocket"],
  cors: {
    origin: frontendOrigins,
    credentials: true,
  },
});

// Load database
require("./database")();

// Init page settings
require("./utils/setting").settingInitDatabase();

// Enable if you are behind a reverse proxy
app.set("trust proxy", 1);

// Set other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(
  cors({
    origin: frontendOrigins,
    credentials: true,
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Mount routes
app.use("/", require("./routes")(io));
app.use("/public", express.static(path.join(__dirname, "public")));

// Serve frontend assets when built
const frontendBuildPath = path.join(__dirname, "../growcsn-frontend/dist");
const frontendBuildExists = fs.existsSync(frontendBuildPath);
console.log(`Frontend build path: ${frontendBuildPath} exists=${frontendBuildExists}`);
if (frontendBuildExists) {
  app.use(express.static(frontendBuildPath));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

// Mount sockets
require("./sockets")(io);

// Set app port
const PORT = process.env.SERVER_PORT || process.env.PORT || 5001;

server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
