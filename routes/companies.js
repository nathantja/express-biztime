"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");


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

  const company = result.rows;
  return res.json({ company });
});





module.exports = router;