const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan"); // Ensure this is included
require("dotenv").config();

// Import routes
const transactionRoutes = require("./routes/transaction");
const statisticsRoutes = require("./routes/statistics");
const barChartRoutes = require("./routes/barchart");
const pieChartRoutes = require("./routes/piechart");
const combinedRoutes = require("./routes/combined");
const initializedRoutes = require("./routes/initialized"); // Ensure this is correct

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Add logging middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch((error) => console.log("MongoDB connection error:", error));

// Define routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/barchart", barChartRoutes);
app.use("/api/piechart", pieChartRoutes);
app.use("/api/combined", combinedRoutes);
app.use("/api/initialized", initializedRoutes); // Ensure this is correct

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
