const express = require("express");
const router = express.Router();
const { getBarChart } = require("../controllers/transactionController");

router.get("/", getBarChart);

module.exports = router;