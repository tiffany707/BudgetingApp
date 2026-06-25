import OpenAI from "openai";
const client = new OpenAI();

export const categorizeTransaction = async (description, amount) => {
    try{
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages:[
                {
                    role:'system',
                    content: 'You are a budgeting helper. Categorize the given transaction into exactly ONE of these categories: Groceries, Utilities, Housing, Health, Beauty & Fashion, Subscriptions, Investments, Entertainment, Income, Dining Out, Transportation. Respond with ONLY the category name.'
                },
                {
                    role:'user',
                    content: `Transaction: ${description} Amount: $${amount}`
                }
            ],
            temperature: 0,
            
        });
        const choice = response.choices?.[0];
        if (!choice?.message?.content) {
            throw new Error('OpenAI returned no content');
        }

        return choice.message.content.trim();
    }
    catch(error){
        console.error("OpenAI API Error:", error);
        throw error;
    }
}