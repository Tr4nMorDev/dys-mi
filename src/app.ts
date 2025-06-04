// src/app.ts

import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import corsOptions from "./config/corsConfig";
import routes from "./routes/index.routes";

const app: Application = express();
// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(cors(corsOptions));

// Routes
app.use("/", routes);

export default app;
