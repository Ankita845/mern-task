const express = require("express");
const router = express.Router();
const { getPieChart } = require("../controllers/transactionController");

router.get("/", getPieChart);

module.exports = router;