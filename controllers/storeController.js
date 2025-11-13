// const path = require('path');
// const Dish = require('../model/dish');



// exports.getStore = (req, res, next) => {
//  res.render('index');
// };

// // exports. = (req, res, next) => {
// //   console.log("Order has been placed");
// //   res.render('order');
// // };

// exports.Order = (req, res, next) => {
//   console.log("loading the store page");
//   Dish.find().then((dishes)=>{
//   res.render('order', {dishes: dishes});
//  });
// };

// exports.pizza = (req, res, next) => {
//   console.log("looking for pizza menu");
//   res.render('pizza');
// };

// exports.addToCart = (req, res) => {
//   const dishid = req.params.id;

//   if (!req.session.cart) req.session.cart = [];
//   if (!req.session.cart.includes(dishid)) {
//     req.session.cart.push(dishid);
//   }

//   res.redirect("/cart");
// };




const Dish = require("../model/dish");
const path = require("path");


// Home page
exports.getStore = (req, res) => {
  res.render("index",{
    isLogedin: req.isLogedin, 
    user : req.session.user
  });
};


// Order page
// exports.Order = (req, res) => {
//   console.log("loading the store page");
//   Dish.find()
//     .then((dishes) => {
//       res.render("order", { dishes: dishes });
//     })
//     .catch((err) => console.error(err));
// };

// exports.Order = (req, res, next) => {
//   console.log("loading the store page");
//   Dish.find().then((dishes)=>{
//   res.render('order', {dishes: dishes});
//  });
// };
// Pizza page
exports.pizza = (req, res) => {
  console.log("looking for pizza menu");
  res.render("pizza",{
    isLogedin: req.isLogedin,
      user : req.session.user
  });
};

// Add to cart
exports.addToCart = (req, res) => {
  const dishid = req.params.id;

  if (!req.session.cart) req.session.cart = [];
  if (!req.session.cart.includes(dishid)) {
    req.session.cart.push(dishid);
    }

  res.redirect("/cart",{
    isLogedin: req.isLogedin, 
    user : req.session.user
  });
  
};
exports.getwaiting = async (req, res, next) => {
  try {
    // Use the same order object as in the success page
    const orderId = req.session.OrderId; // stored after checkout
    if (!orderId) {
      return res.send("No recent order found. Please place an order first.");
    }

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.send("Order not found in database.");
    }

    // Render waiting page with same order reference
    res.render('waiting', {
      isLogedin: req.isLogedin,
      user: req.session.user,
      order, // pass the order here
    });
  } catch (err) {
    console.error(err);
    res.send("Something went wrong. Please try again.");
  }
};


exports.getContact = (req, res) => {
  res.render("contact",{
    isLogedin: req.isLogedin, 
    user : req.session.user
  });
};

exports.postContact = (req, res) => {
  res.render("postContact",{
    isLogedin: req.isLogedin, 
    user : req.session.user
  });
};


// View cart

// exports.renderCartPage = async (req, res) => {
//   try {
//     let cartItems = [];
//     let cartCount = 0;

//     if (req.session.user) {
//       // ✅ User is logged in → get cart from DB
//       const userCart = await Cart.findOne({ userId: req.session.user._id });

//       if (userCart && userCart.items.length > 0) {
//         // Fetch dishes with full details
//         const dishIds = userCart.items.map(item => item.dishId);
//         const dishes = await Dish.find({ _id: { $in: dishIds } });

//         cartItems = userCart.items.map(item => {
//           const dish = dishes.find(d => d._id.toString() === item.dishId.toString());
//           return {
//             ...item.toObject(),
//             dishName: dish?.name || "Unknown Dish",
//             price: dish?.price || 0,
//             image: dish?.image || "/images/default-dish.png"
//           };
//         });

//         cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0); // total quantity
//       }
//     } else if (req.session.cart) {
//       // If user is not logged in, fallback to session cart
//       cartItems = req.session.cart;
//       cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
//     }

//     res.render('cart', { cartItems, cartCount });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };


