document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    const weeklyChart = new Chart(document.getElementById('weeklyChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Production',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });

    const monthlyChart = new Chart(document.getElementById('monthlyChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Production',
                data: [],
                backgroundColor: 'rgb(75, 192, 192)'
            }]
        }
    });

    const efficiencyChart = new Chart(document.getElementById('efficiencyChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Equipment Efficiency (%)',
                data: [],
                backgroundColor: 'rgb(153, 102, 255)'
            }]
        }
    });

    // Form submission
    document.getElementById('productionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await fetch('/production/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            updateCharts();
            e.target.reset();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Update charts function
    async function updateCharts() {
        try {
            const productionResponse = await fetch('/production/stats');
            const productionData = await productionResponse.json();
            
            updateChart(weeklyChart, productionData.weeklyData);
            updateChart(monthlyChart, productionData.monthlyData);
            
            const efficiencyResponse = await fetch('/equipment/efficiency');
            const efficiencyData = await efficiencyResponse.json();
            
            updateEfficiencyChart(efficiencyChart, efficiencyData);
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    function updateChart(chart, data) {
        chart.data.labels = data.map(item => item._id);
        chart.data.datasets[0].data = data.map(item => item.totalProduction);
        chart.update();
    }

    function updateEfficiencyChart(chart, data) {
        chart.data.labels = data.map(item => item.equipmentId);
        chart.data.datasets[0].data = data.map(item => item.efficiency);
        chart.update();
    }

    // Add this after the existing updateCharts function
    async function updateMetrics() {
        try {
            const operatorResponse = await fetch('/production/stats');
            const { operatorStats } = await operatorResponse.json();
            
            const maintenanceResponse = await fetch('/equipment/maintenance-schedule');
            const maintenanceData = await maintenanceResponse.json();
            
            updateOperatorStats(operatorStats);
            updateMaintenanceSchedule(maintenanceData);
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    function updateOperatorStats(stats) {
        const container = document.getElementById('operatorStats');
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Operator</th>
                        <th>Production</th>
                        <th>Efficiency</th>
                        <th>Hours</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(stat => `
                        <tr>
                            <td>${stat._id}</td>
                            <td>${stat.totalProduction.toFixed(2)}</td>
                            <td>${(stat.avgEfficiency * 100).toFixed(1)}%</td>
                            <td>${stat.totalHours.toFixed(1)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }

    function updateMaintenanceSchedule(schedule) {
        const container = document.getElementById('maintenanceSchedule');
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Status</th>
                        <th>Next Maintenance</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedule.map(item => `
                        <tr>
                            <td>${item.equipmentId}</td>
                            <td class="status-${item.status.toLowerCase()}">${item.status}</td>
                            <td>${new Date(item.nextMaintenance).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }

    // Add this to the existing setInterval
    setInterval(() => {
        updateCharts();
        updateMetrics();
    }, 300000); // Update every 5 minutes

    // Initial chart update
    updateCharts();

    // Initial load
    updateMetrics();
}); 