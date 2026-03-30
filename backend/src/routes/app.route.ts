import { Router } from "express";
import { JWT_SECRET, POCKETHOST_URL, SECRET_TOKEN, USERID } from "../utils/contants";
import { authenticate } from "../middleware/auth";
import jwt from 'jsonwebtoken';
import { NoteItem, NoteResponse } from "../utils/type";


const router = Router();

// Simple login
router.post("/login", (req, res) => {
    const username = req.body?.username;
    if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ message: "username is required" });
    }

    const payload = { username };
    const token = jwt.sign(payload, JWT_SECRET);
    res.json({ token });
});

// List Notes
router.get("/notes", async (req, res) => {
    const page = req.query.page || 1;
    const response = await fetch(`${POCKETHOST_URL}?page=${page}&sort=-created`);
    const data: NoteResponse = await response.json();
    res.json(data);
});

// Create Note
router.post("/notes", authenticate, async (req, res) => {
    const { title, content } = req.body;
    if (typeof title !== "string" || typeof content !== "string") {
        return res.status(400).json({ message: "title and content are required" });
    }

    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SECRET_TOKEN}`
            },
            body: JSON.stringify({
                title,
                content,
                user_id: USERID
            })
        }

        const response = await fetch(POCKETHOST_URL, options);
        const data: NoteItem = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(201).json(data);
    } catch {
        return res.status(500).json({ message: "Failed to create note" });
    }

});

// View Note
router.get("/notes/:id", async (req, res) => {
    try {
        const response = await fetch(`${POCKETHOST_URL}/${req.params.id}`);
        const data: NoteItem = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch {
        res.status(500).json({ message: "Failed to fetch note" });
    }
});

// Update Note
router.patch("/notes/:id", authenticate, async (req, res) => {
    const { title, content } = req.body;
    if (typeof title !== "string" || typeof content !== "string") {
        return res.status(400).json({ message: "title and content are required" });
    }

    try {
        const options = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SECRET_TOKEN}`
            },
            body: JSON.stringify({
                title,
                content,
                user_id: USERID
            })
        }
        const response = await fetch(`${POCKETHOST_URL}/${req.params.id}`, options);
        const data: NoteItem = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch {
        res.status(500).json({ message: "Failed to update note" });
    }
});

// Delete Note
router.delete("/notes/:id", authenticate, async (req, res) => {
    try {
        const options = {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${SECRET_TOKEN}`
            }
        }
        const response = await fetch(`${POCKETHOST_URL}/${req.params.id}`, options);

        if (!response.ok) {
            return res.status(response.status).json({ message: "Failed to delete note" });
        }

        res.json({ message: `Note with id ${req.params.id} deleted successfully` });
    } catch {
        res.status(500).json({ message: "Failed to delete note" });
    }
});

export default router;