import { Router } from "express";
import { POCKETHOST_URL } from "../utils/contants";

const router = Router();

router.get("/notes", (req, res) => {
    console.log(POCKETHOST_URL);
    res.json({ message: "This is the notes endpoint" });
});

export default router;