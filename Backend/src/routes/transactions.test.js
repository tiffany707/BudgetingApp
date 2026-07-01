import { describe, it, expect, vi, beforeEach } from "vitest";
import  request  from "supertest";



//test OpenAI and the categorizer

//Mock OpenAI
vi.mock("../openaiService.js", () =>({
    categorizeTransaction: vi.fn().mockResolvedValue("Subscriptions")
}))



vi.mock("../db.js", () => {
    const mockClient = {
            query: vi.fn(),
            release: vi.fn()
        }
    return{
        pool:{
            connect: vi.fn().mockResolvedValue(mockClient)
        },
        __mockClient: mockClient
    }   
});

const { categorizeTransaction } = await import("../openaiService.js");
const {default: app} = await import("../app.js");
const { __mockClient: mockClient } = await import("../db.js");

//Good requests
describe("POST /api/categorizer -good", () => {
    beforeEach(()=>{
        vi.clearAllMocks();
    })

    it("returns good status and also message, transactions and category name", async () =>{
        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({rows:[{id: 1}]})
            .mockResolvedValueOnce({rows:[{date:"2026-06-21", description:"Spotify Charge", amount: 19.99, category_id: 1, rawRowJson: { source: "manual_ai_input", api_used: "gpt-4o-mini" }}]})
            .mockResolvedValueOnce(undefined)

            const res = await request(app).post("/api/categorizer").send({amount: "19.99", description:"Spotify Charge", date:"2026-06-21"});

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({
                message: "Transaction saved",
                transactions: [{date:"2026-06-21", description:"Spotify Charge", amount: 19.99, category_id: 1, rawRowJson: { source: "manual_ai_input", api_used: "gpt-4o-mini" }}],
                category_name: "Subscriptions",
            })
            expect(categorizeTransaction).toHaveBeenCalledWith("Spotify Charge", "19.99");
            expect(mockClient.release).toHaveBeenCalled();
    });
});

//Bad requests
describe("POST /api/categorizer -bad",  () => {
    it("returns 400 when description is missing", async () =>{
        const res = await request(app).post("/api/categorizer").send({amount: "0.00", date:"2026-01-02", description:""})

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing description, amount or date");
    });

    it("returns 400 when amount is missing", async () =>{
        const res = await request(app).post("/api/categorizer").send({description:"Spotify Charge", date:"2026-01-02", amount: undefined})

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing description, amount or date");
    });

    it("returns 400 when date is missing", async () =>{
        const res = await request(app).post("/api/categorizer").send({amount: "19.99", description:"Spotify Charge", date:""})

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing description, amount or date");

    });

});



