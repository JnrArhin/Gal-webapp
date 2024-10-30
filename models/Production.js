const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    equipmentId: {
        type: String,
        required: true
    },
    truckCount: Number,
    scheduledHours: Number,
    workedHours: Number,
    operator: String,
    productionAmount: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Production', productionSchema); 