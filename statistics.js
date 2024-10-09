const express = require("express");
const router = express.Router();
const { getStatistics } = require("../controllers/transactionController");

router.get("/", getStatistics);

module.exports = router;