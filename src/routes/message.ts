import { Router } from "express";
import {
  sendMessage,
  getMessages,
  searchMessages,
} from "../controllers/messageController";
import { isAuthenticated } from "../middlewares/authMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/send", isAuthenticated, upload.single("file"), sendMessage);
router.get("/inbox", isAuthenticated, getMessages);
router.get("/search", isAuthenticated, searchMessages);
export default router;
