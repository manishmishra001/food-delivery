const Dish = require("../model/dish");
const Cart = require("../model/cart");
const Order = require("../model/order");
const dish = require("../model/dish");

// ====================== FETCH SINGLE DISH ======================
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).lean();
    if (!dish) return res.status(404).json({ error: "Dish not found" });

    // Normalize photo field for client consumption
    const photo = dish.photo
      ? "/" + String(dish.photo).replace(/^(\.\/|public\/|\/)+/, "").replace(/\\/g, "/")
      : "/images/panda.png";

    // Return a simplified dish object with normalized photo
    const payload = {
      _id: dish._id,
      name: dish.name,
      desc: dish.desc,
      priceType: dish.priceType,
      price: dish.price,
      halfPrice: dish.halfPrice,
      fullPrice: dish.fullPrice,
      photo,
    };

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== ORDER PAGE ======================
exports.Order = async (req, res) => {
  try {
    const dishes = await Dish.find().lean();
    let cartCount = 0;

    if (req.session.user) {
      const userCart = await Cart.findOne({ userId: req.session.user._id });
      if (userCart && userCart.items.length > 0) {
        cartCount = userCart.items.reduce((acc, item) => acc + item.qty, 0);
      }
    } else if (req.session.cart) {
      cartCount = req.session.cart.reduce((acc, item) => acc + (item.qty || 1), 0);
    }

    res.render("order", { dishes, cartCount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// ====================== CART PAGE ======================
exports.renderCartPage = async (req, res) => {
  try {
    let cartItems = [];
    let cartCount = 0;

    if (req.session.user) {
      const userCart = await Cart.findOne({ userId: req.session.user._id }).lean();
      if (userCart && userCart.items.length > 0) {
        const dishIds = userCart.items.map((i) => i.dishId);
        const dishes = await Dish.find({ _id: { $in: dishIds } }).lean();

        cartItems = userCart.items.map((item) => {
          const dish = dishes.find((d) => d._id.toString() === item.dishId.toString());
          if (!dish) return null;

          return {
            _id: item._id,
            name: dish.name,
            price: dish.price,
            qty: item.qty || item.quantity || 1,
            photo: dish.photo
              ? "/" + dish.photo.replace(/^(\.\/|public\/|\/)/, "").replace(/\\/g, "/")
              : "/images/panda.png",
          };
        }).filter(Boolean);

        cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
        req.session.cart = cartItems; // ✅ keep in session for checkout
      }
    } else if (req.session.cart && req.session.cart.length) {
      cartItems = req.session.cart;
      cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
    }

    res.render("cart", { cartItems, cartCount });
  } catch (err) {
    console.error("Error loading cart page:", err);
    res.status(500).send("Error loading cart page");
  }
};





// ====================== LOGIN CHECK ======================
exports.checkLogin = (req, res) => {
  res.json({ loggedIn: req.session.isLoggedIn === true });
};


// ====================== SYNC CART ======================
// controllers/cartController.js (replace existing syncCart)
exports.syncCart = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.status(400).json({ success: false, message: "Invalid user" });

    const { cart } = req.body;
    if (!Array.isArray(cart)) return res.status(400).json({ success: false, message: "Invalid cart" });

    // Normalize image paths & required fields
    const normalizedCart = cart.map(item => {
      const photoRaw = item.photo || "";
      const photo = photoRaw
        ? "/" + photoRaw.replace(/^(\.\/|public\/|\/)/, "").replace(/\\/g, "/")
        : "/images/panda.png";

      return {
        _id: item._id || undefined,
        name: item.name || "Unnamed Dish",
        price: Number(item.price) || 0,
        qty: Number(item.qty) || Number(item.quantity) || 1,
        photo,
        size: item.size || undefined,
        extra: item.extra || undefined,
      };
    });

    await Cart.findOneAndUpdate(
      { userId },
      { items: normalizedCart, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Update session immediately so checkout reads it
    req.session.cart = normalizedCart;

    console.log(`Cart synced for user ${userId}. Items: ${normalizedCart.length}`);
    res.json({ success: true, items: normalizedCart.length });
  } catch (err) {
    console.error("Cart sync error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// ====================== CHECKOUT PAGE ======================
exports.getCheckout = (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const cart = req.session.cart || [];

    if (!cart.length) {
      return res.render("checkout", {
        user: req.session.user,
        cart: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      });
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    // ✅ Normalize photo path
    const cartWithImages = cart.map((item) => ({
      ...item,
      photo: item.photo
        ? "/" + item.photo.replace(/^(\.\/|public\/|\/)/, "").replace(/\\/g, "/")
        : "/images/panda.png",
    }));

    res.render("checkout", {
      user: req.session.user,
      cart: cartWithImages,
      subtotal,
      deliveryFee,
      total,
    });
  } catch (error) {
    console.error("Error rendering checkout:", error);
    res.status(500).send("Something went wrong at checkout.");
  }
};



// ====================== POST CHECKOUT ======================

exports.postCheckout = async (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/login");

  const { name, mobile, address, city, pincode, state, country, payment } = req.body;
  const cart = req.session.cart || [];

  // Handle empty cart
  if (!cart.length) {
    return res.render("checkout", {
      user: req.session.user,
      cart,
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      errors: ["Your cart is empty."]
    });
  }

  // Validate required shipping details
  if (!name || !mobile || !address || !city || !pincode || !state || !country) {
    return res.render("checkout", {
      user: req.session.user,
      cart,
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      errors: ["Please fill in all required address fields."]
    });
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  try {
    // ✅ FIXED — Properly structured address object
    const order = new Order({
      userId: req.session.user._id || null,
      userName: name,
      mobile,
      address: {
        street: address,  // mapping your flat form field into nested structure
        city,
        state,
        country,
        pincode,
      },
      paymentMethod: payment,
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      total,
      status: "Pending",
    });

    await order.save();

    // Clear cart
    req.session.cart = [];

    res.render("waiting", { order, user: req.session.user });
  } catch (err) {
    console.error("Checkout failed:", err);
    res.status(500).send("Checkout failed");
  }
};
