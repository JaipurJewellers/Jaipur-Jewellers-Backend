import Favorite from '../model/favorite.model.js';
import {Product} from '../model/product.model.js';


export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Product already in favorites' });
    }

    const favorite = new Favorite({
      user: userId,
      product: productId
    });

    await favorite.save();
    
    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    const favorite = await Favorite.findOneAndDelete({ 
      user: userId, 
      product: productId 
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({
      success: true,
      message: 'Product removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 }).lean();

    const productIds = favorites.map(fav => fav.product);

    const products = await Product.find({product_id: {$in: productIds}}).lean()

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};