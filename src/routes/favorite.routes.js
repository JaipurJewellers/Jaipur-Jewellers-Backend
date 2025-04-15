import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
} from '../controllers/favorites.controller.js';
import protectRoutes from '../utils/protectedRoutes.js';

const router = express.Router();
console.log('hii')
router.post('/add', protectRoutes.authenticateToken, addToFavorites);
router.delete('/remove/:productId', protectRoutes.authenticateToken, removeFromFavorites);
router.get('/my-favorites', protectRoutes.authenticateToken, getUserFavorites);

export default router;