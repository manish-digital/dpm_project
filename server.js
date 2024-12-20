// Require and configure dotenv
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const routes = require("./createRoutes.js")();
const initSQL = require("./database/mysqlConnection.js");
const cors = require("cors");
const { initializeSocketServer } = require("./v1/socket/socketServer.js");
const app = express();


// const PORT = process.env.PORT || 4545;
const SOCKET_PORT = process.env.SOCKET_PORT || 4040;
// const corsOptions = {
//   origin: process.env.ALLOW_ORIGIN || "http://localhost:3000" || "http://localhost:4545", // replace with your frontend origin
// };

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4545"], // Add allowed client origins here
  methods: ["GET", "POST"],
};



app.use(cors(corsOptions));

app.use(require("./v1/utils/response/responseHandler"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use helmet middleware
app.use(helmet());
app.use("/uploads", express.static("uploads"));

if (app.get("env") === "development") {
  app.use(morgan("dev"));
  console.log("Morgan Enabled - API Request will be logged in terminal.");
}

 

app.use("/api/" + process.env.API_VER, routes);

// Handling Errors
app.use((err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});


app.get("/apin", async (req, res) => {
  console.log("hello there");
  res.json({ message: "**Welcome to next generation Status application." });
});

 
const PORT = process.env.PORT 

// startSocketServer(4040);
initializeSocketServer(SOCKET_PORT);
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});





 // server.js

// require("dotenv").config();
// const http = require("http");
// const express = require("express");
// const morgan = require("morgan");
// const helmet = require("helmet");
// const cors = require("cors");
// const routes = require("./createRoutes.js")();
// const { initializeSocketServer, emitEvent } = require("./v1/socket/socketServer");

// const app = express();
// const PORT = process.env.PORT || 3000;
// const SOCKET_PORT = process.env.SOCKET_PORT || 4040;

// const corsOptions = {
//   origin: ["http://localhost:3000", "http://localhost:4545"], // Add allowed client origins here
//   methods: ["GET", "POST"],
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(helmet());
// app.use("/uploads", express.static("uploads"));

// if (app.get("env") === "development") {
//   app.use(morgan("dev"));
//   console.log("Morgan Enabled - API Request will be logged in terminal.");
// }

// app.use("/api/" + process.env.API_VER, routes);

// // API test route
// app.get("/apin", async (req, res) => {
//   console.log("Hello there");
//   res.json({ message: "**Welcome to the next generation Status application." });
// });

// // Start HTTP Server
// const server = http.createServer(app);
// server.listen(PORT, () => {
//   console.log(`HTTP Server is running on port ${PORT}`);
// });

// // Start Socket.IO Server
// initializeSocketServer(SOCKET_PORT);

// // Emit test event (Example: fetchWalletBalance)
// // setTimeout(() => {
// //   emitEvent("fetchWalletBalance", { message: "Wallet balance updated." });
// // }, 5000);

 
