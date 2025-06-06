import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import corsOptions from "./config/corsConfig";
import routes from "./routes/index.routes";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.static("public"));

// Routes
app.use("/", routes);

export default app;
