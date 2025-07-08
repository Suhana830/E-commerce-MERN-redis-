import { trusted } from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js"

export const getAllProducts = async (req, res) => {

    try {
        const products = await Product.find();
        // console.log(products + " in backend");

        res.json({
            products: products
        })


    } catch (error) {
        console.log("Error in Product controller", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");

        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis, fetch from mongodb
        // .lean() is gonna return a plain javascript object instead of a mongodb document
        // which is good for performance
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // store in redis for future quick access


        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" })
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        })

        res.status(201).json(product)
    } catch (error) {
        console.log("Error in Product controller", error.message);
        res.status(500).json({ message: error.message });

    }
}

export const deleteProduct = async (req, res) => {

    try {

        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product)
            return res.status(404).json({ message: "product not found" });

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("delete image from cloudinary");
            } catch (error) {
                console.log("error deleting image from cloudinary", error);

            }
        }
        await Product.findByIdAndDelete({ _id: productId });
        return res.json({ message: "deleted successfully" })

    } catch (error) {
        console.log("Error in Product controller", error.message);
        res.status(500).json({ message: error.message });

    }
}
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }
            }
        ]);

        return res.status(200).json(products);
    } catch (error) {
        console.error("Error in getRecommendedProducts controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProductByCategory = async (req, res) => {

    try {

        const categoryName = req.params.category;
        const products = await Product.find({ category: categoryName });
        // console.log(products);


        return res.json({ products: products });

    } catch (error) {
        console.log("Error in getProductByCategory controller", error.message);
        res.status(500).json({ message: error.message });

    }
}

export const toggleFeaturedProduct = async (req, res) => {



    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();



            res.json(updatedProduct);


        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function updateFeaturedProductsCache() {
    try {

        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts), "Ex", 7 * 24 * 60 * 60);

    } catch (error) {
        console.log("Error in UpdateFeaturedProductCache controller", error.message);
        res.status(500).json({ message: error.message });

    }
}