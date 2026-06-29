import express from "express";
import {pool} from "../db.js";
import { categorizeTransaction } from "../openaiService.js";


const router = express.Router();
//categorizeTransaction for the uploader
router.post("/api/categorizer", async(req, res) =>{
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


//categorize batches
router.post("/api/categorizerBatch", async (req, res) =>{
    const dbClient = await pool.connect();
    try{
        const { transactions } = req.body;
       

        if(!Array.isArray(transactions) || transactions.length === 0){
            return res.status(400).json({error: "No transaction provided"});
        }

        await dbClient.query('BEGIN');

        const savedTransactions = [];

        for(const tx of transactions){
            const {description, amount, date} = tx;

            if(!description || amount == undefined || amount == null, !date){
                throw new error((`Invalid transaction: ${JSON.stringify(tx)}`))
            }

            //predict
            const ai_predicted_category = await categorizeTransaction(description, amount);

            const category_query = `
                INSERT INTO category (name) VALUES ($1)
                ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id;
            `;
            const category_result = await dbClient.query(category_query, [ai_predicted_category]);
            const category_id = category_result.rows[0].id;

            const transaction_query = `
                INSERT INTO transactions (date, description, amount, category_id, raw_data)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;

            const rawRowJson = JSON.stringify({ source: "csv_upload", api_used: "gpt-4o-mini" });

            
            const transaction_result = await dbClient.query(transaction_query, [
                date, description, amount, category_id, rawRowJson
            ]);

            savedTransactions.push(transaction_result.rows[0]);

        }

        await dbClient.query("COMMIT")

        res.json({ 
            message: `${savedTransactions.length} transactions saved`,
            transactions: savedTransactions
        })

    }
    catch(error){
        dbClient.query('ROLLBACK');
        console.error("A categorizing batch error occured,", error);
        res.status(500).json({error: "Failed to process the batch"})
    }
    finally{
        dbClient.release();
    }
})

//categorizeTransaction
router.get("/ai-test", async (req, res) =>{
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

//Dashboard
router.get("/api/dashboard", async (req, res) =>{

    try{
        const transaction_query = `
        SELECT
            transactions.id,
            transactions.date,
            transactions.amount,
            transactions.description,
            category.name AS category_name
        FROM transactions
        JOIN category ON category.id = transactions.category_id
        ORDER BY transactions.date DESC;
        `

        const results = await pool.query(transaction_query);

        res.json(results.rows);
        
    }
    catch(error){
        console.log("dashboard could not be retrieved.", error);
        res.status(500).json({error: 'Could not retrieve the dashboard'});
    }
   
})

export default router;