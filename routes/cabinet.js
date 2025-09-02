const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Planet = require('../models/Planet');
const router = express.Router();

// Получение данных пользователя для ЛК
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('planets')
      .populate('currentPlanet');
    
    res.json({
      user: {
        username: user.username,
        email: user.email,
        score: user.score,
        rank: user.rank,
        resources: user.resources
      },
      planets: user.planets,
      currentPlanet: user.currentPlanet
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Обновление профиля пользователя
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
