"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");


/** Get info on all invoices.
 * Returns JSON: {invoices: [{id, comp_code}, ...]}
 */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
             FROM invoices
             `);
  const invoices = results.rows;

  return res.json({ invoices });
});

/** Get info on specific invoice.
 * Returns JSON: {invoice: {id, amt, paid,add_date, paid_date,
 * company: {code, name, description}}
 */
router.get('/:id', async function (req, res) {
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
            FROM invoices
            WHERE id = $1`, [req.params.id]);

  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError("Invoice not found.");

  const cResults = await db.query(
    `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [invoice.comp_code]);

  invoice.company = cResults.rows[0];
  delete invoice.comp_code;

  return res.json({ invoice });
});


/** Create new invoice. Accepts JSON: {comp_code, amt}
 *  Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('/', async function (req, res) {
  const comp_code = req.body.comp_code;
  const amt = req.body.amt;
  if ((!comp_code) || (!amt)) throw new BadRequestError("Missing data.")

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
          VALUES ($1, $2)
          RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];

  if (!invoice) {
    throw new BadRequestError();
  }
  return res.status(201).json({ invoice });

});







module.exports = router;