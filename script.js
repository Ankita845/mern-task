const monthSelect = document.getElementById('monthSelect');
const searchBox = document.getElementById('searchBox');
const tableBody = document.getElementById('tableBody');
const totalSold = document.getElementById('totalSold');
const totalSoldItems = document.getElementById('totalSoldItems');
const totalNotSoldItems = document.getElementById('totalNotSoldItems');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// Function to fetch transactions
function fetchTransactions() {
    const selectedMonth = monthSelect.value;
    // Your existing logic to fetch and populate transactions based on the selected month
}

// Function to fetch bar chart data
function fetchBarChartData() {
    const selectedMonth = monthSelect.value;

    fetch(`/api/barchart?month=${selectedMonth}`)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('barChartContainer').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels, // e.g., ['0-50', '51-100', '101-150', ...]
                    datasets: [{
                        label: 'Number of Items',
                        data: data.values, // e.g., [12, 19, 3, ...]
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching bar chart data:', error);
        });
}

// Call fetchBarChartData when the month changes
monthSelect.addEventListener("change", () => {
    fetchTransactions();      // Call to fetch transactions when month changes
    fetchBarChartData();     // Call to fetch bar chart data when month changes
});

// Initial fetch of transactions and bar chart
fetchTransactions();         // Initial call to populate transactions
fetchBarChartData();        // Initial call to populate bar chart
