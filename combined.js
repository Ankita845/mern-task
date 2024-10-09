const express = require("express");
const router = express.Router();
const { getCombinedData } = require("../controllers/transactionController");

router.get("/", getCombinedData);

module.exports = router;