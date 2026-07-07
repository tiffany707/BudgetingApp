import {vi, describe, it, expect, beforeEach} from "vitest"

vi.mock("./redisClient.js", () =>{
    const redisClient = {
        get: vi.fn() ,
        set: vi.fn()
    }
    return{
        default: redisClient,
        __mockRedis: redisClient
    }
});

vi.mock("openai", () =>{
    const mockCreate = vi.fn();

    return{
        default: class{
            constructor(){
                this.chat = {completions:{
                    create: mockCreate
                }}
            }
        },
        __mockaiAPI: mockCreate
    }
})

//Imports 

const  { categorizeTransaction } = await import("./openaiService.js");
const { __mockRedis: mockRedis } = await import ("./redisClient.js");
const { __mockaiAPI: mockaiAPI } = await import ("openai");

describe("Successful prompt", () => {
    beforeEach(() =>{
        vi.clearAllMocks();
    })

    it( "success - category in cache", async () =>{
        mockRedis.get.mockResolvedValue("Subscription");

        const res = await categorizeTransaction("Spotify Charge", 9.99);

        expect(res).toBe("Subscription");
        expect(mockRedis.get).toHaveBeenCalledWith("category: spotify charge")
        expect(mockaiAPI).not.toHaveBeenCalled();
    }); 

    it("success - category not in cache", async () =>{
        mockRedis.get.mockResolvedValue(null);
        mockaiAPI.mockResolvedValue({choices: [{message:{content: "Subscription"}}]})
        mockRedis.set.mockResolvedValue(null);

        const res = await categorizeTransaction("Spotify Charge", 9.99);

        expect(res).toBe("Subscription");
        expect(mockRedis.get).toHaveBeenCalledWith("category: spotify charge");
        expect(mockaiAPI).toHaveBeenCalled();
        expect(mockRedis.set).toHaveBeenCalledWith(
            "category: spotify charge",
            "Subscription",
            "EX",
            expect.any(Number)
        );


    });

});

describe("error", () =>{
    beforeEach(() =>{
        vi.clearAllMocks();
    })

    it("Choice returns null", async () =>{
        mockRedis.get.mockResolvedValue(null);
        mockaiAPI.mockResolvedValue({choices: [null]});

        await expect(categorizeTransaction("Spotify Charge", 9.99)).rejects.toThrow('OpenAI returned no content');
        
    })

    it("API fails", async () =>{
        mockRedis.get.mockResolvedValue(null);
        mockaiAPI.mockRejectedValue(new Error("OpenAPI error"));

        await expect(categorizeTransaction("Spotify Charge", 9.99)).rejects.toThrow("OpenAPI error");
    })
})
