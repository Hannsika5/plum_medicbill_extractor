import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import amountRoutes from "./routes/amountRoutes.js"; 
import multer from "multer";
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/api", amountRoutes);

const port = 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
