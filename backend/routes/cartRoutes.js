import express from "express"
import { addToCart, getCartProducts, removeAllFromCart, removeAllProductFromCart, updateQuantity } from "../controllers.js/cartController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/:id", protectRoute, removeAllFromCart);
router.put('/:id', protectRoute, updateQuantity);
router.get("/removeCart", protectRoute, removeAllProductFromCart)

export default router;

// getCartProducts