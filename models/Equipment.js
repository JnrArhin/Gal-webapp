const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    equipmentId: {
        type: String,
        required: true,
        unique: true
    },
    type: String,
    status: {
        type: String,
        enum: ['operational', 'maintenance', 'breakdown', 'idle'],
        default: 'operational'
    },
    operator: String,
    scheduledHours: Number,
    workedHours: Number,
    lastMaintenance: Date,
    maintenanceHistory: [{
        date: Date,
        type: String,
        description: String,
        duration: Number
    }],
    efficiency: {
        type: Number,
        default: 0
    },
    utilization: {
        type: Number,
        default: 0
    },
    availability: {
        type: Number,
        default: 100
    }
}); 