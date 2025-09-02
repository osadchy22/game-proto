const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  planets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planet'
  }],
  currentPlanet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planet'
  },
  resources: {
    energy: { type: Number, default: 1000 },
    minerals: { type: Number, default: 500 },
    oxygen: { type: Number, default: 300 },
    water: { type: Number, default: 200 },
    food: { type: Number, default: 100 }
  },
  researchProgress: {
    // Можете добавить поля по мере развития игры
    basicTech: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
