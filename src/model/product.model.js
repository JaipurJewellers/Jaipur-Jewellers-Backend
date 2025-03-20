import mongoose, { Schema } from 'mongoose'


const quantityPriceSchema = Schema({
    quantity: {
        type: String,
        // required: true,
    },
    price: {
        type: Number,
        // required: true,
    },
});

const productSchema = Schema({
    name: {
        type: String,
        // required: true,
    },
    product_id: {
        type: String,
        // required: true,
    },
    Image: {
        type: String,
    },
    Image1: {
        image: {
            type: String,
        },
        color: {
            type: String,
            default: "181818"
        }
    },
    Image2: {
        image: {
            type: String,
        },
        color: {
            type: String,
            default: "181818"
        }
    },
    Image3: {
        image: {
            type: String,
        },
        color: {
            type: String,
            default: "181818"
        }
    },
    desc: {
        type: String,
        // required: true,
    },
    quantityPrices: [quantityPriceSchema],
    category: {
        type: String,
        // required: true,
    },
    countInStock: {
        type: Number,
        // required: true,
        min: 0,
        max: 1000,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    model: {
        type: String,
        // required: true,
    },
    weight: {
        type: String,
        // required: true,
    },
    width: {
        type: String,
        // required: true,
    },
    height: {
        type: String,
        // required: true,
    },
    depth: {
        type: String,
        // required: true,
    },
    details: [
        {
            details: { type: String }
        }
    ]
});

// Exporting the model
export const Product = mongoose.model("Product", productSchema);