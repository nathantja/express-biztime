"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

//FIXME: use blank lines to separate groups of thought

/** Get info on all invoices.
 * Returns JSON: {invoices: [{id, comp_code}, ...]}
 */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
             FROM invoices`
  );
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
            WHERE id = $1`,
    [req.params.id]
  );

  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError("Invoice not found.");

  const cResults = await db.query(
    `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
    [invoice.comp_code]
  );

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
  if ((!comp_code) || (!amt)) throw new BadRequestError("Missing data.");

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
          VALUES ($1, $2)
          RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];

  if (!invoice) {
    throw new BadRequestError("Failed to create invoice.");
  }
  return res.status(201).json({ invoice });

});

// TODO: Ask about if this should accept everything, or make it a patch?
/** Edit an invoice. Accepts JSON: {id, amt, comp_code, paid, add_date, paid_date}
 *  Returns JSON: {id, comp_code, amt, paid, add_date, paid_date}
 */
router.put('/:id', async function (req, res) {

  const id = req.params.id;
  const amt = req.body.amt;
  const comp_code = req.body.comp_code;
  const paid = req.body.paid;
  const add_date = req.body.add_date;
  const paid_date = req.body.paid_date;
  let result;

  try {
    result = await db.query(
      `UPDATE invoices
            SET amt = $1,
            comp_code = $2,
            paid = $3,
            add_date = $4,
            paid_date = $5
        WHERE id = $6
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, comp_code, paid, add_date, paid_date, id]
    );
  } catch (error) {
    // can check if error is specific instance of error class... but diff solution later
    throw new BadRequestError('missing data');
  }

  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError("invoice not found");

  return res.json({ invoice });
});


/** Delete an invoice.
 *  Returns {status: "deleted"}
 */
router.delete('/:id', async function (req, res) {
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
            FROM invoices
            WHERE id = $1`,
    [req.params.id]
  );

  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError("Invoice not found.");

  await db.query(
    `DELETE FROM invoices WHERE id = $1`,
    [req.params.id]
  );
  //FIXME: can use returning statement to check if something was deleted

  return res.json({ status: "deleted" });
});



module.exports = router;