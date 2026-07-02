import express from "express";
import { pool } from "./db.js"
import { categorizeTransaction } from "./services/openaiService.js";
import cors from 'cors';
import transactionRouter from "./routes/transactions.js";
import categoriesRouter from "./routes/categories.js";

//DELETE CONSOLE.LOG
//FIX CORS



const app = express();
app.use(cors()); //FIX LATER THIS IS BAD FOR PRODUCTION 
app.use(express.json());

//Routers
app.use("/api", transactionRouter);
app.use("/api", categoriesRouter);


//test cors
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is alive!' });
});



app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Budgeting App API!" });
});

//get db
app.get("/db-test", async (req, res) => {
    const result = await pool.query("SELECT * FROM category");
    res.json(result.rows);
});

export default app;