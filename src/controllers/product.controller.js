import { Product } from "../model/product.model.js";
import mongoose from "mongoose";
import fs from "fs";
import xlsx from "xlsx";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// get all products
export const getAllProducts = async (req, res) => {
    try {
        // If no pagination is specified
        if (!req.query.page && !req.query.limit) {
            const products = await Product.find();

            const transformedProducts = products.map(product => ({
                ...product.toObject(),
                details: product.details.map(detailObj => detailObj.details),
            }));

            return res.status(200).json(transformedProducts);
        }

        // Handle pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const productList = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        const transformedProductList = productList.map(product => ({
            ...product.toObject(),
            details: product.details.map(detailObj => detailObj.details),
        }));

        res.status(200).json({
            products: transformedProductList,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            hasMore: page * limit < totalProducts,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

//logic to get single product
export const getSingleProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }

    try {
        const product = await Product.findById(id);

        if (product) {
            // Transform `details` field
            const transformedProduct = {
                ...product.toObject(),
                details: product.details.map(detailObj => detailObj.details), // Flatten `details`
            };

            res.status(200).json(transformedProduct);
        } else {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};


export const createProduct = async (req, res) => {
    try {
        const {
            name,
            product_id,
            desc,
            category,
            countInStock,
            quantityPrices,
            model,
            weight,
            width,
            height,
            depth,
            details,
            image1Color,
            image2Color,
            image3Color
        } = req.body;

        // Handling file uploads (if available)
        let image, image1, image2, image3;

        if (req.files?.Image) {
            image = await uploadOnCloudinary(req.files.Image[0].path);
        }
        if (req.files?.Image1) {
            image1 = await uploadOnCloudinary(req.files.Image1[0].path);
        }
        if (req.files?.Image2) {
            image2 = await uploadOnCloudinary(req.files.Image2[0].path);
        }
        if (req.files?.Image3) {
            image3 = await uploadOnCloudinary(req.files.Image3[0].path);
        }

        // Construct product data, only adding fields that exist
        const updateData = {};

        if (name) updateData.name = name;
        if (product_id) updateData.product_id = product_id;
        if (desc) updateData.desc = desc;
        if (category) updateData.category = category;
        if (countInStock) updateData.countInStock = countInStock;
        if (model) updateData.model = model;
        if (weight) updateData.weight = weight;
        if (width) updateData.width = width;
        if (height) updateData.height = height;
        if (depth) updateData.depth = depth;

        if (details) {
            try {
                updateData.details = JSON.parse(details).map(detail => ({ details: detail }));
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid details format" });
            }
        }

        if (quantityPrices) {
            try {
                updateData.quantityPrices = JSON.parse(quantityPrices);
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid quantityPrices format" });
            }
        }

        if (image) updateData.Image = image.secure_url;
        if (image1) updateData.Image1 = { image: image1.secure_url, color: image1Color || null };
        if (image2) updateData.Image2 = { image: image2.secure_url, color: image2Color || null };
        if (image3) updateData.Image3 = { image: image3.secure_url, color: image3Color || null };

        // Save product even if only partial data is provided
        const newProduct = new Product(updateData);
        const response = await newProduct.save();

        if (response) {
            res.status(201).json({ success: true, message: "Product created successfully" });
        } else {
            res.status(400).json({ success: false, message: "Error creating product" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const updateProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const {
            name,
            desc,
            category,
            countInStock,
            quantityPrices,
            model,
            weight,
            width,
            height,
            depth,
            details,
            image1Color,
            image2Color,
            image3Color
        } = req.body;

        // Check if the product exists
        const isProductExist = await Product.findOne({ product_id });
        if (!isProductExist) {
            return res.status(404).json({
                success: false,
                message: "Product doesn't exist",
            });
        }

        const updateData = {};

        // Update fields if provided
        if (name) updateData.name = name;
        if (desc) updateData.desc = desc;
        if (category) updateData.category = category;
        if (countInStock) updateData.countInStock = countInStock;
        if (model) updateData.model = model;
        if (weight) updateData.weight = weight;
        if (width) updateData.width = width;
        if (height) updateData.height = height;
        if (depth) updateData.depth = depth;
        if (image1Color) updateData["Image1.color"] = image1Color;
        if (image2Color) updateData["Image2.color"] = image2Color;
        if (image3Color) updateData["Image3.color"] = image3Color;
        if (quantityPrices) updateData.quantityPrices = JSON.parse(quantityPrices);
        if (details) {
            updateData.details = JSON.parse(details).map(detail => ({ details: detail }));
        }

        if (req.files) {
            if (req.files.Image) {
                const image = await uploadOnCloudinary(req.files.Image[0].path);
                updateData.Image = image.secure_url;
            }
            if (req.files.Image1) {
                const image1 = await uploadOnCloudinary(req.files.Image1[0].path);
                updateData.Image1.image = image1.secure_url;
            }
            if (req.files.Image2) {
                const image2 = await uploadOnCloudinary(req.files.Image2[0].path);
                updateData.Image2.image = image2.secure_url;
            }
            if (req.files.Image3) {
                const image3 = await uploadOnCloudinary(req.files.Image3[0].path);
                updateData.Image3.image = image3.secure_url;
            }
        }

        // Perform the update operation
        const response = await Product.findOneAndUpdate(
            { product_id: product_id },
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (response) {
            res.status(200).json({ success: true, product: response });
        } else {
            res.status(400).json({ success: false, message: "Error updating product" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }

    try {
        const product = await Product.findByIdAndDelete(id);
        if (product) {
            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}
export const createProductFromExcel = async (req, res) => {
    try {
        // ✅ Correct File Path
        const filePath = path.resolve("C:/Users/Dell/Desktop/JaipurJwellers/Jaipur_Jwellers_Backend/data/product.xlsx");

        // ✅ Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found at " + filePath });
        }

        // ✅ Read the Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // ✅ Array to store products
        let products = [];

        // ✅ Loop through each row in Excel file
        for (const item of sheetData) {
            const {
                name,
                product_id,
                desc,
                category,
                countInStock,
                price,
                model,
                weight,
                width,
                height,
                depth,
                details,
                Image,
                Image1,
                Image2,
                Image3,
                image1Color,
                image2Color,
                image3Color
            } = item;

            // ✅ Check if product already exists
            const isProductExist = await Product.findOne({ product_id });
            if (isProductExist) {
                console.log(`⚠️ Product already exists: ${product_id}`);
                continue; // Skip this product if it already exists
            }


            // ✅ Create Product Object
            const productData = {
                name,
                product_id,
                desc,
                category,
                countInStock: countInStock || 0,
                model,
                weight,
                width,
                height,
                depth,
                details: details ? details.split(",").map((detail) => ({ details: detail.trim() })) : [],
                quantityPrices: [
                    {
                        price,
                    }
                ],
                Image,
                Image1,
                Image2,
                Image3,
            };

            products.push(productData);
        }

        // ✅ Insert all products into MongoDB
        if (products.length > 0) {
            await Product.insertMany(products);
            res.status(201).json({ success: true, message: "Products inserted successfully", count: products.length });
        } else {
            res.status(400).json({ success: false, message: "No new products to insert" });
        }
    } catch (error) {
        console.error("❌ Error inserting products:", error);
        res.status(500).json({ success: false, message: "Failed to insert products" });
    }
};