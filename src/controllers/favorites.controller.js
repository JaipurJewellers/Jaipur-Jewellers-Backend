import Favorite from '../model/favorite.model.js';
import {Product} from '../model/product.model.js';

// Add product to favorites
export const addToFavorites = async (req, res) => {
  try {
    console.log("req.body -> ", req.body)
    const { productId } = req.body;
    const userId = req.id;

    // Check if already favorited
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

// Remove product from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

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

// Get user's favorites with product details
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId })
      .populate('products')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      favorites
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};