import { Router } from "express";
import { Message } from "../app-shared/api-types.js";

const router = Router();

router.get("/api", (req, res) => {
  console.log("request received for /api");
  const msg: Message = {
    content: "Hello World from API",
    date: new Date().toString(),
  };
  res.json(msg);
});

export default router;
