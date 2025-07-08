import Product from "../models/product.model.js";
import User from "../models/User.model.js";


export const getCartProducts = async (req, res) => {
    try {
        // Extract product IDs from cart items
        const productIds = req.user.cartItem.map(item => item.product);

        // Fetch product details
        const products = await Product.find({ _id: { $in: productIds } });

        // Map products with quantity from cart
        const cartItems = products.map(product => {
            const item = req.user.cartItem.find(ci => ci.product.toString() === product._id.toString());
            return { ...product.toJSON(), quantity: item.quantity };
        });



        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {

    try {

        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItem.find((item) => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItem.push({ product: productId, quantity: 1 });
        }

        await user.save();
        req.user = user;
        res.json(user.cartItems);

    } catch (error) {

        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: error.message });


    }
}

export const removeAllFromCart = async (req, res) => {
    try {

        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItem = [];
        }
        else {
            user.cartItem = user.cartItem.filter((item) => item.product.toString() !== productId.toString());

        }

        await user.save();
        res.json(user.cartItem);

    } catch (error) {

        console.log("Error in RemoveAllFromCart controller", error.message);
        res.status(500).json({ message: error.message });


    }
}
export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;


        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });


        const existingItem = user.cartItem.find((item) =>
            item.product.toString() === productId.toString()
        );

        if (existingItem) {
            if (quantity === 0) {

                user.cartItem = user.cartItem.filter(
                    (item) => !item.product.equals(productId)
                );
            } else {

                existingItem.quantity = quantity;
            }


            await user.save();


            return res.json(user.cartItem);
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.error("Error in updateQuantity controller:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllProductFromCart = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);
        user.cartItem = [];
        await user.save();

        res.status(200).json("success");
    } catch (error) {

        console.log("remove all items from cart");
        res.status(500).json({ message: "Server error", error: error.message });

    }

}