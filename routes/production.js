const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

router.post('/record', async (req, res) => {
    try {
        const production = new Production({
            ...req.body,
            date: new Date()
        });
        await production.save();
        res.status(201).json(production);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const weeklyData = await Production.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalProduction: { $sum: "$productionAmount" },
                    avgCycleTime: { $avg: "$cycleTime" },
                    totalTrucks: { $sum: "$truckCount" },
                    efficiency: {
                        $avg: { $divide: ["$workedHours", "$scheduledHours"] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyData = await Production.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalProduction: { $sum: "$productionAmount" },
                    avgCycleTime: { $avg: "$cycleTime" },
                    totalTrucks: { $sum: "$truckCount" },
                    efficiency: {
                        $avg: { $divide: ["$workedHours", "$scheduledHours"] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const operatorStats = await Production.aggregate([
            {
                $group: {
                    _id: "$operator",
                    totalProduction: { $sum: "$productionAmount" },
                    avgEfficiency: {
                        $avg: { $divide: ["$workedHours", "$scheduledHours"] }
                    },
                    totalHours: { $sum: "$workedHours" }
                }
            }
        ]);

        res.json({ weeklyData, monthlyData, operatorStats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 