import React from 'react'
import { useCartStore } from '../stores/useCartStore'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { MoveRight } from 'lucide-react';
import toast from 'react-hot-toast';

function OrderSummary() {

    const { total, subtotal, coupon, isCouponApplied, removeCart, getCartItems } = useCartStore();
    const savings = subtotal - total;
    const formattedTotal = total.toFixed(2);
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedSavings = savings.toFixed(2);
    const navigate = useNavigate();


    const handleClick = async () => {
        toast.success("Payment successfull");
        await removeCart();
        await getCartItems();


        setTimeout(() => {
            navigate("/");
        }, 2000);
    }
    return (
        <motion.div className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className='text-xl font-semibold text-emerald-400 '>Order Summary</p>

            <div className='space-y-4'>
                <div className='space-y-2'>
                    <dl className='flex items-center justify-between gap-4'>
                        <dt className='text-base font-normal text-gray-300'>Original price</dt>
                        <dd className='text-base font-normal text-gray-300'>{formattedSubtotal}</dd>
                    </dl>


                    {savings > 0 && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Savings</dt>
                            <dd className='text-base font-normal text-gray-300'>{formattedSavings}</dd>
                        </dl>
                    )}

                    {coupon && isCouponApplied && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
                            <dd className='text-base font-normal text-gray-300'>-{coupon.discountPercentage}</dd>
                        </dl>
                    )}

                    <dl className='flex items-center justify-between gap-4'>
                        <dt className='text-base font-normal text-gray-300'>Total</dt>
                        <dd className='text-base font-normal text-gray-300'>{formattedTotal}</dd>
                    </dl>
                </div>
                <motion.button
                    className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}


                >
                    <p onClick={handleClick}>Proceed to CheckOut</p>
                </motion.button>

                <div className='flex items-center justify-center gap-2'>
                    <span className='text-sm font-normal text-gray-400'>or</span>
                    <Link
                        to='/'
                        className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
                    >
                        Continue Shopping
                        <MoveRight size={16} />
                    </Link>
                </div>

            </div>
        </motion.div>
    )
}

export default OrderSummary