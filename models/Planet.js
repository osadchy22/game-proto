const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  biomeType: {
    type: String,
    required: true,
    enum: ['forest', 'desert', 'ocean', 'volcanic', 'arctic', 'mountain', 'grassland']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  capacity: {
    type: Number,
    default: 4 // Максимум игроков на планете
  },
  currentPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  coordinates: {
    x: Number,
    y: Number,
    z: Number
  },
  resources: {
    energy: { type: Number, default: function() {
      // Разное количество ресурсов в зависимости от биома
      if (this.biomeType === 'volcanic') return 1500;
      if (this.biomeType === 'ocean') return 1200;
      return 1000;
    }},
    minerals: { type: Number, default: function() {
      if (this.biomeType === 'mountain') return 1200;
      return 800;
    }},
    oxygen: { type: Number, default: function() {
      if (this.biomeType === 'forest') return 1000;
      return 600;
    }},
    water: { type: Number, default: function() {
      if (this.biomeType === 'ocean') return 2000;
      if (this.biomeType === 'desert') return 300;
      return 800;
    }},
    food: { type: Number, default: function() {
      if (this.biomeType === 'grassland') return 900;
      return 500;
    }}
  },
  buildings: [{
    type: {
      type: String,
      enum: ['mine', 'power_plant', 'farm', 'lab', 'habitat']
    },
    level: {
      type: Number,
      default: 1
    },
    coordinates: {
      x: Number,
      y: Number
    },
    builtAt: {
      type: Date,
      default: Date.now
    }
  }],
  portal: {
    level: {
      type: Number,
      default: 0
    },
    connectedPlanets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Planet'
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Метод для проверки, есть ли место на планете
planetSchema.methods.hasSpace = function() {
  return this.currentPlayers.length < this.capacity;
};

// Метод для добавления игрока на планету
planetSchema.methods.addPlayer = function(userId) {
  if (this.hasSpace() && !this.currentPlayers.includes(userId)) {
    this.currentPlayers.push(userId);
    return true;
  }
  return false;
};

module.exports = mongoose.model('Planet', planetSchema);
