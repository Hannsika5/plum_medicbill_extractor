import express from "express";
import multer from "multer";
import { extractFromImage } from "../controllers/amountController.js"; 

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/extract-amounts", upload.single("billImage"), extractFromImage);

export default router; 
