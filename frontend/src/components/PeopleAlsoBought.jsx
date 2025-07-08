import React from 'react'
import ProductCard from './ProductCard';
import { useState } from 'react';
import { useEffect } from 'react';

import toast from 'react-hot-toast';
import axios from '../lib/axios.js';
import LoadingSpinner from './LoadingSpinner.jsx';



// const recommendation = [];

function PeopleAlsoBought() {

    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {

            try {
                const res = await axios.get("products/recommendations");

                setRecommendations(res.data)

            } catch (error) {
                toast.error("An error occured to fetch recommended product");
            }
            finally {
                setIsLoading(false);
            }

        }

        fetchRecommendations()
    }, [])

    if (isLoading)
        return <LoadingSpinner />
    return (
        <div className='mt-8'>
            <h3 className='text-2xl font-semibold text-emerald-400'>
                People also bought
            </h3>
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {recommendations && recommendations.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default PeopleAlsoBought