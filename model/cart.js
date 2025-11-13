// models/cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  size: String,
  toppings: [String],
  photo: { type: String, default: "/images/default.jpg" },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
