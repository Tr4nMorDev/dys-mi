const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const corsOptions = require("./config/corsConfig");
const routes = require("./routes/index.routes.js");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(cors(corsOptions));

// Routes
app.use("/", routes);

module.exports = app;
