import express from "express";
import { pool } from "./db.js"
import { categorizeTransaction } from "./openaiService.js";
import cors from 'cors';


const app = express();
app.use(cors()); //FIX LATER THIS IS BAD FOR PRODUCTION 
app.use(express.json());

//test cors
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is alive!' });
});

//categorizeTransaction for the uploader
app.post("/api/categorizer", async(req, res) =>{
    const dbClient = await pool.connect();

    try{
        
        const {description, amount, date} = req.body;
        if(!description || amount == undefined || amount == null || !date){
            return res.status(400).json({error: "Missing description or amount"})
        }

        const ai_predicted_category = await categorizeTransaction(description, amount);

        //begin query
        await dbClient.query('BEGIN');
            
        //category
        const category_query = (`
            INSERT INTO category (name) VALUES ($1)
            ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        `);

        const category_result = await dbClient.query(category_query, [ai_predicted_category]);
        const category_id = category_result.rows[0].id;

        //transaction
        const transaction_query = (`
            INSERT INTO transactions (date, description, amount, category_id, raw_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `);
        
        const rawRowJson = JSON.stringify({ source: "manual_ai_input", api_used: "gpt-4o-mini" });

        const transaction_result = await dbClient.query(transaction_query, [date, description, amount, category_id, rawRowJson]);

        //commit
        await dbClient.query("COMMIT");

        res.json({
            message: "Transaction saved",
            transactions: transaction_result.rows,
            category_name: ai_predicted_category,
        });
        
    }
    catch(error){
        await dbClient.query("ROLLBACK");
        console.error("error message", error)
        res.status(500).json({error: "Internal server error"});
    }
    finally{
        dbClient.release();
    }
});


//categorizeTransaction
app.get("/ai-test", async (req, res) =>{
    try{
        const description = 'Spotify Charge';
        const amount = 9.99;

        const category = await categorizeTransaction(description, amount);


        res.json({
            message: 'OpenAI categorized successfully',
            input: {description, amount},
            ai_predicted_category: category,
        });

        
    }
    catch(error){
        res.status(500).json({error: "Failed to connect to OpenAi", error_message:error.message})
    }
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Budgeting App API!" });
});

//get db
app.get("/db-test", async (req, res) => {
    const result = await pool.query("SELECT * FROM category");
    res.json(result.rows);
});

app.listen("5000", () => console.log("listening on port 5000"));