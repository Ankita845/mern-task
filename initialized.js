const express = require("express");
const router = express.Router();
const { initializeData, getTransactions } = require("../controllers/transactionController");

// Define your routes
router.post("/initialized", initializeData);  // For initializing data
router.get("/", getTransactions);  // For getting transactions

module.exports = router;