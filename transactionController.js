const Transaction = require("../models/myTransaction");
const axios = require("axios");

// Fetch seed data from the API and populate the database
exports.initializeData = async (req, res) => {
    try {
        const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");

        // Filter out invalid records where price is not a number
        const validData = response.data.filter(item => 
            typeof item.price === 'number' && !isNaN(item.price) && 
            item.title && item.description && item.dateOfSale && item.category
        );

        await Transaction.deleteMany(); // Clear existing data
        await Transaction.insertMany(validData); // Insert only valid data

        res.status(200).send("Database initialized with seed data");
    } catch (error) {
        res.status(500).json({ message: "Error initializing data", error });
    }
};

// List all transactions with pagination and search
exports.getTransactions = async (req, res) => {
    try {
        const { search = "", page = 1, perPage = 10 } = req.query;

        // Ensure page and perPage are numbers
        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);

        // Create a regex for searching strings
        const regexSearch = new RegExp(search, 'i');

        const query = {
            $or: [
                { title: regexSearch },
                { description: regexSearch }
            ],
        };

        // Add price to query if it's a valid number
        if (!isNaN(search) && search.trim() !== "") {
            const priceValue = parseFloat(search);
            query.price = { $eq: priceValue }; // Match exact price
        }

        const transactions = await Transaction.find(query)
            .skip((pageNum - 1) * perPageNum)
            .limit(perPageNum);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error });
    }
};

// Get statistics for selected month
exports.getStatistics = async (req, res) => {
    const { month } = req.query;

    // Validate the month
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month provided." });
    }

    const start = new Date(`2022-${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    try {
        const totalSale = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: start, $lt: end }, sold: true } },
            { $group: { _id: null, totalAmount: { $sum: "$price" }, totalSoldItems: { $sum: 1 } } }
        ]);

        const totalNotSold = await Transaction.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: false });

        res.json({
            totalSaleAmount: totalSale[0]?.totalAmount || 0,
            totalSoldItems: totalSale[0]?.totalSoldItems || 0,
            totalNotSoldItems: totalNotSold
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching statistics", error });
    }
};

// Bar chart for price ranges
exports.getBarChart = async (req, res) => {
    const { month } = req.query;

    // Validate the month
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month provided." });
    }

    const start = new Date(`2022-${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const priceRanges = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-200", min: 101, max: 200 },
        { range: "201-300", min: 201, max: 300 },
        { range: "301-400", min: 301, max: 400 },
        { range: "401-500", min: 401, max: 500 },
        { range: "501-600", min: 501, max: 600 },
        { range: "601-700", min: 601, max: 700 },
        { range: "701-800", min: 701, max: 800 },
        { range: "801-900", min: 801, max: 900 },
        { range: "901-above", min: 901, max: Infinity },
    ];

    try {
        const chartData = await Promise.all(
            priceRanges.map(async ({ range, min, max }) => {
                const count = await Transaction.countDocuments({
                    dateOfSale: { $gte: start, $lt: end },
                    price: { $gte: min, $lt: max }
                });
                return { range, count };
            })
        );

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bar chart data", error });
    }
};

// Pie chart for unique categories
exports.getPieChart = async (req, res) => {
    const { month } = req.query;

    // Validate the month
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month provided." });
    }

    const start = new Date(`2022-${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    try {
        const categories = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: start, $lt: end } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pie chart data", error });
    }
};

// Combined response API
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;

    // Validate the month
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month provided." });
    }

    try {
        // Await each result before sending the response
        const statistics = await exports.getStatistics(req, res);
        const barChart = await exports.getBarChart(req, res);
        const pieChart = await exports.getPieChart(req, res);

        res.json({ statistics, barChart, pieChart });
    } catch (error) {
        res.status(500).json({ message: "Error fetching combined data", error });
    }
};
