const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const equipmentRoutes = require('./routes/equipment');
const productionRoutes = require('./routes/production');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Routes
app.use('/equipment', equipmentRoutes);
app.use('/production', productionRoutes);

app.get('/', (req, res) => {
    res.render('dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 