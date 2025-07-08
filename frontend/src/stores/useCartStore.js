import { create } from 'zustand';
import axios from '../lib/axios.js';
import { toast } from "react-hot-toast";


export const useCartStore = create((set, get) => ({

    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getCartItems: async () => {
        try {

            const res = await axios.get("/cart")


            set({ cart: res.data });
            get().calculateTotals();


        } catch (error) {
            set({ cart: [] });
            toast.error(error.response?.data?.message || "An error occurred in Cart Items get");
        }
    },
    addToCart: async (product) => {
        try {
            await axios.post("/cart", { productId: product._id });
            toast.success("Product added to cart");

            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1 }];


                return { cart: newCart };
            });



            get().calculateTotals();
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }
    ,
    removeFromCart: async (productId) => {
        await axios.delete(`/cart/${productId}`, { data: { productId } });
        set((prevState) => {
            const currentCart = prevState.cart || []; // <-- Defensive default
            return { cart: currentCart.filter((item) => item._id !== productId) };
        });
        get().calculateTotals();
    },

    updateQuantity: async (productId, quantity) => {

        try {

            if (quantity === 0) {
                get().removeFromCart(productId);
                return;
            }


            await axios.put(`/cart/${productId}`, { quantity: quantity });
            set((prevState) => ({
                cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
            }));
            get().calculateTotals();

        } catch (error) {
            console.log("Error in userCart updateFunction");
            toast.error("Quantity update error");
        }

    },


    calculateTotals: () => {
        const { cart, coupon } = get();
        // console.log("calculateTotal cart : ", cart);
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        console.log("subtotal", subtotal);

        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },
    removeCart: async () => {

        try {
            await axios.get("/cart/removeCart");

        } catch (error) {
            console.log("error in removing all cart items");


        }
    }

}))