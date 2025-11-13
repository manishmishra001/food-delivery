// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   userName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   items: [
//     {
//       name: { type: String, required: true, trim: true },
//       qty: { type: Number, required: true, min: 1 },
//       price: { type: Number, required: true, min: 0 }
//     }
//   ],
//   total: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//     default: "Pending"
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("Order", orderSchema);



const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true }
  },
  paymentMethod: { type: String, required: true, trim: true },
  items: [
    {
      name: { type: String, required: true, trim: true },
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }
  ],
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Dispatched", "Delivered", "Cancelled"],
    default: "Pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);

