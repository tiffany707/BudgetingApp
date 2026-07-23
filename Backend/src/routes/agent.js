import OpenAI from "openai";
import { getTransactionsDB } from "./agentFunctions.js";
import express from "express";

const openai = new OpenAI();
const router = express.Router();

const tools = [
    {
        type: "function",
        function:{
            name: "getTransactions",
            description:  "Fetch a user's transactions, optionally filtered by category and date range",
            parameters:{
                type: "object",
                properties: {
                    search: {type: "string", description: "A merchant or keyword to search for in the description, like 'Superstore' or 'Amazon'"},
                    category: {type: "string", description: "return ONE of these categories based off of what the user is looking for: Groceries, Utilities, Housing, Health, Beauty & Fashion, Subscriptions, Investments, Entertainment, Income, Dining Out, Transportation. Respond with ONLY the category name "},
                    startDate: {type: "string", description: "YYYY-MM-DD"},
                    endDate: {type: "string", description: "YYYY-MM-DD"}
                }
            }
        }
    }
];


router.post("/agent", async(req, res)=>{

    const { message, conversationHistory } = req.body;
    

    if ( !message){
        return res.status(400).json({error:"There was no message inputted for this request."})
    }

    const safeHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

    const filteredHistory = safeHistory.filter((chat) =>{
        return chat.role == "assistant" || chat.role == "user"
    })

    const messages = [
        {
            role: 'system', content: `You are a budgeting assistant. Use the getTransactions tool to answer questions about the user's spending. Never fabricate numbers — always call the tool to get real data. Keep answers concise. 

CRITICAL RULE FOR YEARS: The current year is 2026, the current month is July. If the user mentions a month or "this year" without specifying a year, you MUST use 2026. Never use 2023 or any other past year. 

When you call the tool for a full year or month, calculate the exact date range for 2026 (e.g., if they ask for "this year", startDate must be "2026-01-01" and endDate must be "2026-12-31"; if they ask for "June", startDate must be "2026-06-01" and endDate must be "2026-06-30"). 

In your final response to the user, explicitly state the date range you searched (e.g., "From June 1, 2026, to June 30, 2026").`
        },
        ...filteredHistory,
        {
            role: 'user', content: message
        }
    ]

    const MAX_ITERATIONS = 5;
    let current_iterations = 0;
    let finalMessage = "";

    try{
        while(current_iterations < MAX_ITERATIONS && !finalMessage){
            current_iterations ++;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", 
                messages,
                tools
            });

            const choices = response.choices[0];

            if(choices.finish_reason == "tool_calls"){
                messages.push(choices.message);

                for(let toolCall of choices.message.tool_calls){
                    const args = JSON.parse(toolCall.function.arguments)
                    const rows = await getTransactionsDB(args)
                    console.log(rows)
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(rows)
                    })
                }
                
            }
            else{
                finalMessage = choices.message.content;
            }
        }
        console.log(finalMessage);
        const cleanMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content || ""
        }));

        return res.json({ 
            response: finalMessage || "I wasn't able to complete the request in time", 
            messages: cleanMessages 
        });
        
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: "Something went wrong processing your request"})
    }
})

export default router;