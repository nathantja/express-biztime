// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompanies;

beforeEach(async function () {
  await db.query(`DELETE FROM companies`);

  let result = await db.query(`
      INSERT INTO companies (code, name, description)
        VALUES
        ('apple', 'Apple Computer', 'Maker of OSX.'),
        ('ibm', 'IBM', 'Big blue.')
        RETURNING code, name`
  );

  testCompanies = result.rows;
});

describe("GET /companies", function () {
  test("get all companies", async function () {
    const resp = await request(app).get("/companies");

    expect(resp.body).toEqual({ companies: testCompanies });
  });
});