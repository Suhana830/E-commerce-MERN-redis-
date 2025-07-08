import express from 'express'

import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductByCategory, getRecommendedProducts, toggleFeaturedProduct } from '../controllers.js/productController.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductByCategory);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct)
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/recommendations", protectRoute, getRecommendedProducts);


export default router;