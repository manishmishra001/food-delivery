// const mongoose = require('mongoose');

// const dishSchema = new mongoose.Schema({
//   category: { type: String, required: true },   
//   name: { type: String, required: true },
//   desc: { type: String, required: true },        
//   price: { type: Number, required: true },      
//   photo: { type: String }                        
// });

// module.exports = mongoose.model('dish', dishSchema);



const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  priceType: {
    type: String,
    enum: ['general', 'half-full'],
    default: 'general'
  },
  price: {
    type: Number, // used when priceType === 'general'
  },
  halfPrice: {
    type: Number, // used when priceType === 'half-full'
  },
  fullPrice: {
    type: Number, // used when priceType === 'half-full'
  },
  photo: { type: String }
});

module.exports = mongoose.model('Dish', dishSchema);
