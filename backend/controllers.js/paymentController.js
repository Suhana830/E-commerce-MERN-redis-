import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
    try {

        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0)
            return res.status(400).json({ error: "Invalid or empty products array" });

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = (product.price) * product.quantity;
            totalAmount += amount;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount
                }
            }
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);

            }
        }

        const session = await stripe.checkout.session.create({
            payment_method_type: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage)
                }
            ] : []

        })





    } catch (error) {

    }
}


async function createStripeCoupon(discountPercentage) {
    // const coupon = await stripe.coupons.create({
    //     percent_off : di
    // })
    return null;
}