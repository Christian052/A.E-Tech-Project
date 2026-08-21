const request = require("supertest");

// NOTE: index.js auto-starts the server + DB connection on import.
// For a fuller test suite, refactor index.js to export the app separately
// from the listen()/connectDB() bootstrap so tests can run without a live DB.
describe("GET /api/health", () => {
  it("responds with ok status", async () => {
    const app = require("../index");
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
