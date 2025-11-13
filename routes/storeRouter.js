const express = require("express");
const storeRouter = express.Router();
const storeController = require("../controllers/storeController");

// Define routes
storeRouter.get("/", storeController.getStore);
// storeRouter.get("/order", storeController.Order);
storeRouter.get("/pizza", storeController.pizza);
storeRouter.post("/addToCart/:id", storeController.addToCart);
storeRouter.get("/waiting", storeController.getwaiting);
// storeRouter.get("/cart", storeController.getCart);



storeRouter.get("/contact", storeController.getContact);
storeRouter.post("/contact", storeController.postContact);

module.exports = storeRouter;
