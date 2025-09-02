const express = require('express');
const auth = require('../middleware/auth');
const Planet = require('../models/Planet');
const User = require('../models/User');
const router = express.Router();

// Создание первой планеты с биомами на 4 человек
router.post('/create-starter', auth, async (req, res) => {
  try {
    const { planetName, biomeType } = req.body;
    
    // Проверяем, есть ли у пользователя уже планета
    const user = await User.findById(req.user._id);
    if (user.planets.length > 0) {
      return res.status(400).json({ message: 'User already has a planet' });
    }
    
    // Доступные биомы для стартовой планеты
    const availableBiomes = ['forest', 'grassland', 'mountain', 'desert'];
    
    // Если биом не указан или недопустим, выбираем случайный
    const selectedBiome = availableBiomes.includes(biomeType) 
      ? biomeType 
      : availableBiomes[Math.floor(Math.random() * availableBiomes.length)];
    
    // Создаем новую планету
    const planet = new Planet({
      name: planetName || `${user.username}'s Colony`,
      biomeType: selectedBiome,
      capacity: 4,
      coordinates: {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
        z: Math.floor(Math.random() * 1000)
      }
    });
    
    // Добавляем пользователя на планету
    planet.addPlayer(req.user._id);
    
    // Сохраняем планету
    await planet.save();
    
    // Обновляем пользователя
    user.planets.push(planet._id);
    user.currentPlanet = planet._id;
    await user.save();
    
    res.status(201).json({ 
      message: 'Planet created successfully', 
      planet 
    });
  } catch (error) {
    console.error('Create planet error:', error);
    res.status(500).json({ message: 'Error creating planet' });
  }
});

// Получение информации о конкретной планете
router.get('/:planetId', auth, async (req, res) => {
  try {
    const planet = await Planet.findById(req.params.planetId)
      .populate('currentPlayers', 'username score');
    
    if (!planet) {
      return res.status(404).json({ message: 'Planet not found' });
    }
    
    res.json(planet);
  } catch (error) {
    console.error('Get planet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
