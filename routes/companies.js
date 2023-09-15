"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

/** Get all companies as JSON.
 *  Returns {companies: [{code, name}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
             FROM companies
             `);
  const companies = results.rows;
  return res.json({ companies });

});

/** Get info for specific company as JSON.
 *  Returns {company: {code, name, description, invoices: [id, ...]}}
*/
// FIXME: be consistent with req.params.code on 31 vs 64
// FIXME: if there arguments on multiple lines, each arg gets its own line
router.get("/:code", async function (req, res) {
  const cResult = await db.query(
    `SELECT code, name, description
              FROM companies
              WHERE code = $1
              `,
    [req.params.code]
  );

  const company = cResult.rows[0];

  if (!company) {
    throw new NotFoundError("Code not found.");
  }

  const iResult = await db.query(
    `SELECT id
          FROM invoices
          WHERE comp_code = $1`,
    [req.params.code]
  );

  company.invoices = iResult.rows.map(i => i.id);

  return res.json({ company });
});

/** Create new Company
 * Accepts JSON {"code":...,"name":...,"description..."}
 * Returns {company: {code, name, description}}
 */
router.post("/", async function (req, res) {
  // Error Handling for if req.body is {}
  if (Object.keys(req.body).length === 0) throw new BadRequestError();
  console.log(req);

  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
          VALUES ($1, $2, $3)
          RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];

  if (!company) {
    throw new BadRequestError();
  }
  return res.status(201).json({ company });
});

/** Edit Company
 * Accepts JSON {"name":...,"description..."}
 * Returns {company: {code, name, description}}
 */
router.put("/:code", async function (req, res) {
  // Error Handling for if req.body is {}
  if (Object.keys(req.body).length === 0) throw new BadRequestError();
  const { name, description } = req.body;
  // Can check for name or description keys being undefined

  const result = await db.query(
    `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`,
    [name, description, req.params.code]
  );

  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError();
  }
  return res.json({ company });
});

/** Deletes Company
 * Returns ({ message: "Deleted" })
 */
router.delete("/:code", async function (req, res) {


  await db.query(
    `DELETE FROM companies WHERE code = $1`,
    [req.params.code]
  );
  return res.json({ message: "Deleted" });
});



module.exports = router;