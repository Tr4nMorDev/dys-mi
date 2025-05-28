// src/config/corsOptions.ts
import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

export default corsOptions;
