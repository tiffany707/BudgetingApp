import { describe, it, expect } from "vitest";
import  request  from "supertest";
import app from "../app.js"

describe("POST api categorizer", async () => {
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