import {pool} from "../db.js"

export async function getTransactionsDB({search, category, startDate, endDate}){
    console.log(search, category, startDate, endDate)
    let query = `
    SELECT t.id, t.description, t.amount, c.name, t.date
    FROM transactions AS t
    JOIN category AS c ON c.id = t.category_id
    `

    let params = []
    let paramIndex = 1
    let conditions = []

    if(search){
        conditions.push(` t.description ILIKE $${paramIndex}`);
        paramIndex ++;
        params.push(`%${search}%`);
    }

    if(category){
        conditions.push(` c.name = $${paramIndex}`);
        paramIndex ++;
        params.push(category);
    }

    if(startDate){
        conditions.push(` t.date >= $${paramIndex}`);
        paramIndex ++;
        params.push(startDate);
    }

    if(endDate){
        conditions.push(` t.date <= $${paramIndex}`);
        paramIndex ++;
        params.push(endDate);
    }

    if(conditions.length > 0){
        query += ` WHERE ` + conditions.join(" AND ")
    }

    
    query += ` ORDER BY t.date DESC LIMIT 100`;

    console.log(query)

    const results = await pool.query(query, params);

    console.log(results)
    
    return results.rows;
}

