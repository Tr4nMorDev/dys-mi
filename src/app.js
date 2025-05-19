const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Example route
app.get("/", (req, res) => {
  res.send("Welcome to Caro Game API!");
});

// Export app
module.exports = app;
