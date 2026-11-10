# Eloria Handmade Jewellery

## Run the MongoDB checkout backend

1. Copy `.env.example` to `.env`.
2. Add your MongoDB Atlas connection string as `MONGODB_URI`.
3. Run `pnpm start`.
4. Open `http://localhost:3000/home.html`.

The checkout API stores the customer, delivery address, order items, order total, payment method, and only the last four card digits for bank-card orders. It never stores a card number, expiry date, or CVV.
hand made jewellery
