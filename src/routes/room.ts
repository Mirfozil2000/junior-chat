import { Router } from "express";
import { createRoom, getRoomMessages } from "../controllers/roomController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", isAuthenticated, createRoom);
router.get("/messages/:roomId", isAuthenticated, getRoomMessages);

export default router;
