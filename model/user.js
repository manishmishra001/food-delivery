const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({  
  name: { type: String, required: true },      
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: [true, 'Password required'] },

  // 👇 Add this line
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' // all new signups will automatically be "user"
  }
});

module.exports = mongoose.model('User', UserSchema);
