import express from 'express';
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import analysisRoutes from './routes/analyticsRoutes.js'
import cors from 'cors';
import path from 'path'

import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

const _dirname = path.resolve();

const corsOptions = {
    origin: 'http://localhost:5173', // Allow only requests from this origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'],// Allow only these headers
    credentials: true
};


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analysisRoutes);


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "/frontend/dist")));

    app.get("/*", (req, res) => {
        res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();

})