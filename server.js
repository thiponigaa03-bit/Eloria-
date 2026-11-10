import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    telephone: { type: String, required: true, trim: true, maxlength: 20 },
    deliveryAddress: { type: String, required: true, trim: true, maxlength: 500 }
  },
  items: [{ id: String, name: String, price: String, image: String, quantity: Number }],
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cod', 'bank-card'], required: true },
  cardBrand: { type: String, enum: ['visa', 'mastercard', 'amex'] },
  cardLast4: { type: String, match: /^\d{4}$/ },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.static('.'));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?:\+94|0)7\d{8}$/;

app.post('/api/orders', async (request, response) => {
  const { customer, items, total, paymentMethod, cardBrand, cardLast4 } = request.body || {};
  const normalisedPhone = String(customer?.telephone || '').replace(/[\s-]/g, '');

  if (!customer?.name || !emailPattern.test(customer.email) || !phonePattern.test(normalisedPhone) || !customer.deliveryAddress || !Array.isArray(items) || !items.length || !Number.isFinite(total) || total < 0) {
    return response.status(400).json({ message: 'Please provide valid customer, delivery, and cart details.' });
  }

  if (!['cod', 'bank-card'].includes(paymentMethod)) {
    return response.status(400).json({ message: 'Choose cash on delivery or bank card payment.' });
  }

  if (paymentMethod === 'bank-card' && (!['visa', 'mastercard', 'amex'].includes(cardBrand) || !/^\d{4}$/.test(String(cardLast4 || '')))) {
    return response.status(400).json({ message: 'Valid card details are required for bank card payment.' });
  }

  // Never accept or store a complete card number, expiry date, or CVV.
  const order = await Order.create({
    customer: { ...customer, telephone: normalisedPhone },
    items,
    total,
    paymentMethod,
    cardBrand: paymentMethod === 'bank-card' ? cardBrand : undefined,
    cardLast4: paymentMethod === 'bank-card' ? cardLast4 : undefined
  });

  response.status(201).json({ orderId: order.id, status: order.status });
});

app.get('/api/orders/:id', async (request, response) => {
  const order = await Order.findById(request.params.id).select('customer.name items total paymentMethod cardBrand cardLast4 status createdAt');
  if (!order) return response.status(404).json({ message: 'Order not found.' });
  response.json(order);
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB connection string.');
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Eloria is running at http://localhost:${port}`));
}

start().catch((error) => { console.error(error.message); process.exit(1); });
