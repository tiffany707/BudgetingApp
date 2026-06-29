import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name FROM category ORDER BY name ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("Fetch categories error:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

export default router;