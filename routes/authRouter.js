const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");

authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);

// authRouter.post("/send-otp", authController.sendOtp);
// authRouter.post("/verify-otp", authController.verifyOtp);


module.exports = authRouter;
