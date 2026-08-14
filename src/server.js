const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Wake-up endpoint — lightweight SELECT 1 to bring Neon DB out of suspension
app.get('/api/wake', async (req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ status: 'ok', message: 'Database is awake' });
  } catch (error) {
    console.error('Wake-up query failed:', error.message);
    res.status(503).json({ status: 'error', message: 'Database is waking up, try again shortly' });
  }
});

// Basic test route
app.get('/', (req, res) => {
  res.send('E-commerce API is running');
});

// Sync DB config
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully (PostgreSQL).');

    // Sincronizar modelos
    await sequelize.sync({ alter: true });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
