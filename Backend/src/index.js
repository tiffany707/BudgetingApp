import express from "express";
import { pool } from "./db.js"

const app = express();

console.log(process.env.DATABASE_URL);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Budgeting App API!" });
});

//get db
app.get("/db-test", async (req, res) => {
    const result = await pool.query("SELECT * FROM category");
    res.json(result.rows);
});

app.listen("5000", () => console.log("listening on port 5000"));