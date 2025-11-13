const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controllers/cartController");

cartRouter.get("/cart", cartController.renderCartPage);
cartRouter.get("/order", cartController.Order);

// Cart API
cartRouter.get("/api/dishes/:id", cartController.getDishById);
cartRouter.get("/api/check-login", cartController.checkLogin);
cartRouter.post("/api/cart/sync", cartController.syncCart);

cartRouter.post("/sync-cart", cartController.syncCart);


cartRouter.get("/checkout", cartController.getCheckout);
cartRouter.post("/checkout", cartController.postCheckout);


module.exports = cartRouter;

