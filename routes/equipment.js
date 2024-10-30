const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Production = require('../models/Production');

router.post('/add', async (req, res) => {
    try {
        const equipment = new Equipment(req.body);
        await equipment.save();
        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/efficiency', async (req, res) => {
    try {
        const equipment = await Equipment.find();
        const productionData = await Production.aggregate([
            {
                $group: {
                    _id: '$equipmentId',
                    totalWorkedHours: { $sum: '$workedHours' },
                    totalScheduledHours: { $sum: '$scheduledHours' },
                    totalDowntime: { $sum: '$downtime' },
                    totalProduction: { $sum: '$productionAmount' }
                }
            }
        ]);

        const efficiencyData = equipment.map(eq => {
            const prod = productionData.find(p => p._id === eq.equipmentId) || {};
            const efficiency = (prod.totalWorkedHours / prod.totalScheduledHours) * 100 || 0;
            const utilization = ((prod.totalScheduledHours - prod.totalDowntime) / prod.totalScheduledHours) * 100 || 0;
            
            return {
                equipmentId: eq.equipmentId,
                efficiency: efficiency,
                utilization: utilization,
                totalProduction: prod.totalProduction || 0,
                status: eq.status
            };
        });

        res.json(efficiencyData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/maintenance-schedule', async (req, res) => {
    try {
        const equipment = await Equipment.find();
        const maintenanceSchedule = equipment.map(eq => ({
            equipmentId: eq.equipmentId,
            lastMaintenance: eq.lastMaintenance,
            nextMaintenance: new Date(eq.lastMaintenance.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days after last maintenance
            status: eq.status
        }));
        res.json(maintenanceSchedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 