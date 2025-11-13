// External Module
const express = require("express");
const hostRouter = express.Router();

//local Module
const hostController = require("../controllers/hostController");

hostRouter.get("/add-dish", hostController.getadddish);
hostRouter.post("/add-dish", hostController.postadddish);
hostRouter.get("/admin",hostController.getadmin)
hostRouter.post("/admin/:id/status", hostController.updateOrderStatus); 
hostRouter.post("/delete-dish/:id", hostController.deleteDish);






module.exports = hostRouter;