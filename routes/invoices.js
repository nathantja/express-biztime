"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

router.get('/', async function (req, res){

})
module.exports = router;