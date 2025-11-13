const fs = require('fs');
const user = require("../model/user")
const Cart = require('../model/cart');
const Dish = require('../model/dish');
const Order = require('../model/order');




exports.getadddish = (req, res, next) => {
  res.render("host/add-dish",{
    isLogedin: req.isLogedin,
      user : req.session.user
  });
};

exports.postadddish = async (req, res, next) => {
  try {
    // Get all fields from form
    const { category, name, desc, price, half, full } = req.body;

    // Photo (via multer) — store a relative uploads/ path (use filename provided by multer)
    // This avoids storing full OS-specific absolute paths in the DB.
    const photo = req.file ? `uploads/${req.file.filename}` : null;
    if (!photo) {
      console.error('❌ No file uploaded.');
      return res.status(400).send('No file uploaded.');
    }

    // Determine price type automatically
    let priceType = 'general';
    if (half || full) priceType = 'half-full';

    // Ensure at least one price is provided
    if (!price && !half && !full) {
      console.error('❌ No price provided.');
      return res.status(400).send('Please enter at least one price.');
    }

    // Construct dish data
    const newDishData = {
      category: category?.trim() || '',
      name: name?.trim() || '',
      desc: desc?.trim() || '',
      priceType,
      photo
    };

    // Convert and assign numeric prices only if provided
    if (price) newDishData.price = Number(price);
    if (half) newDishData.halfPrice = Number(half);
    if (full) newDishData.fullPrice = Number(full);

    // Save to MongoDB
    const newDish = new Dish(newDishData);
    await newDish.save();

    // Save session info (optional)
    req.session.lastAddedDish = newDish._id;
    req.session.save(err => {
      if (err) console.error('⚠️ Session save error:', err);
      return res.redirect('/order');
    });

    console.log('✅ New Dish Added:', newDish);

  } catch (err) {
    console.error('❌ Error while adding dish:', err);
    return res.status(500).send('Internal Server Error');
  }
};



exports.getadmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId") // get full user details if ref exists
      .lean();

    const user = req.session.user; // current admin
    res.render("host/adminpanel", { orders, user });
  } catch (err) {
    console.error("Error loading admin panel:", err);
    res.status(500).send("Server Error");
  }
};




exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  console.log("🔹 POST received:", { orderId, status });

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn("⚠️ Order not found:", orderId);
      return res.status(404).send("Order not found");
    }

    order.status = status;
    await order.save();

    console.log("✅ Order status updated:", orderId, "→", status);
    res.redirect("/host/admin");
  } catch (err) {
    console.error("❌ Failed to update order status:", err.message);
    res.status(500).send("Failed to update order status: " + err.message);
  }
};


// exports.postDeleteHome = (req, res, next) => {
//   const homeId = req.params.homeId;
//   console.log('Came to delete ', homeId);

//   Home.findByIdAndDelete(homeId)
//     .then(() => {
//       console.log('Home deleted successfully.');
//       res.redirect("/host/host-home-list");
//     })
//     .catch(error => {
//       console.error('Error while deleting:', error);
//       res.redirect("/host/host-home-list");
//     });
// };

exports.deleteDish = async (req, res) => {
  const dishId = req.params.id;
      const dishes = await Dish.find(); 
      let cartCount = 0;
  console.log('Came to delete ', dishId);

  try {
    await Dish.findByIdAndDelete(dishId);
    console.log('Dish deleted successfully.');
    res.render("order", {
      isLogedin: req.isLogedin,
      user: req.session.user,
      dishes,
      cartCount
    });
  } catch (error) {
    console.error('Error while deleting:', error);
    res.render("order", {
      isLogedin: req.isLogedin,
      user: req.session.user,
      dishes,
      cartCount
    });
  }
};


