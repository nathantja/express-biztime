"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

const { NotFoundError } = require("../expressError");

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
 *  Returns {company: {code, name, description}}
 */
router.get("/:code", async function (req, res) {
  const result = await db.query(
    `SELECT code, name, description
              FROM companies
              WHERE code = $1
              `, [req.params.code]);

  const company = result.rows[0];

  if (company === undefined) {
    throw new NotFoundError("Code not found.");
  }

  return res.json({ company });
});

/** Create new Company
 * Returns {company: {code, name, description}}
 */
router.post("/", async function (req, res) {

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
          VALUES ($1, $2, $3)
          RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});

/** Edit Company
 * Returns {company: {code, name, description}}
 */
router.put("/:code", async function (req, res) {

  const result = await db.query(
    `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`,
    [req.body.name, req.body.description, req.params.code]
  );
  const company = result.rows[0];
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