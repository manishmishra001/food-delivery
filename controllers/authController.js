const path = require("path");
const axios = require("axios");
const { check } = require("express-validator");
const e = require("express");
const {validationResult } = require("express-validator");
const { error } = require("console");
const { name } = require("ejs");
const User = require("../model/user");
const { hash } = require("crypto");
const bcrypt = require("bcryptjs");
const user = require("../model/user");

// let otpStore = {};


 // temporary storage for learning (use DB or Redis later)

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    cartCount: 0,
    errors: [],
    oldInput: { name: '', mobile: '', password: '' }
  });
};


// exports.postSignup = [
//   check("name").notEmpty().matches(/^[A-Za-z]+$/).withMessage("Name is required"),
//   check("mobile").isLength({ min: 10, max: 10 }).withMessage("Valid mobile number is required"),
//   check("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters long"),
//   check("confirmPassword").custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error("Password confirmation does not match password");
//     }
//     return true;
//   }).trim(),


//   (req, res) => {
//     const { name, mobile, password} = req.body;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).render("auth/login", {
//         cartCount: 0, // pass dummy variable to fix nav error
//         errors: errors.array().map(err => err.msg),
//         oldInput: { name, mobile, password }
//       });
//     }
//     const newUser = new User({ name, mobile, password });
//     newUser.save()
//       .then(() => {
//         res.render("auth/login", {
//           cartCount: 0,
//           errors: [],
//         });
//       })
//       .catch(err => {
//         console.error("User Save Error:", err);
//         res.status(500).render("auth/signup", {
//           cartCount: 0,
//           errors: ["Server error, please try again later."],
//           oldInput: { name, mobile, password }
//         });
//       });
//   } 
// ]

// GET /signup
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    cartCount: 0,
    errors: [],
    oldInput: { name: "", mobile: "", password: "", confirmPassword: "" },
  });
};

// POST /signup
exports.postSignup = [
  check("name")
    .notEmpty()
    .matches(/^[A-Za-z]+$/)
    .withMessage("Name is required"),
  check("mobile")
    .isLength({ min: 10, max: 10 })
    .withMessage("Valid mobile number is required"),
  check("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  async (req, res) => {
    const { name, mobile, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("auth/signup", {
        cartCount: 0,
        errors: errors.array().map((err) => err.msg),
        oldInput: { name, mobile, password, confirmPassword },
      });
    }

    bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({ name, mobile, password: hashedPassword });
      return user.save();
    }).then(() => {
      res.render("auth/login", {
        cartCount: 0,
        errors: [],
        oldInput: { mobile: "" }, // optional, prefill login form if needed
      });
    }).catch((err) => {
      console.error("User Save Error:", err);
      res.status(500).render("auth/signup", {
        cartCount: 0,
        errors: ["Server error, please try again later."],
        oldInput: { name, mobile, password, confirmPassword },
      });
    });

  }
];

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    cartCount: 0,
    errors: [],
    oldInput: { mobile: '', password: '' },
    isloggedin : false
  });
}

exports.postLogout = (req, res, next) => {
  if (!req.session) {
    return res.redirect("/");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).send("Something went wrong while logging out.");
    }

    // Optional: clear cookies if you’re using a cookie session store
    res.clearCookie("connect.sid");

    res.redirect("/");
  });
};




exports.postLogin = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    const existingUser = await User.findOne({ mobile });

    if (!existingUser) {
      return res.status(422).render("auth/login", {
        cartCount: 0,
        errors: ["User not found"],
        oldInput: { mobile: "" },
        user: {}
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        cartCount: 0,
        errors: ["Invalid password"],
        oldInput: { mobile }
      });
    }

    // ✅ Set session values
    req.session.isLoggedIn = true;
    req.session.user = existingUser;

    console.log("✅ Logged in:", existingUser.name, "-", existingUser.role);

    // ✅ Redirect based on role
    if (existingUser.role === "admin") {
      return res.redirect("/host/admin");
    } else {
      return res.redirect("/order");
    }

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).render("auth/login", {
      cartCount: 0,
      errors: ["Server error. Please try again later."],
      oldInput: { mobile },
    });
  }
};






//-----------this is for otp verification and it will only  after completed the production-----------------//

// exports.sendOtp = async (req, res) => {
//   const { mobile } = req.body;

//   // basic validation
//   if (!mobile || mobile.length !== 10) {
//     return res.status(400).json({ success: false, message: "Invalid mobile number" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000);
//   otpStore[mobile] = otp;

//   try {
//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "otp",
//         variables_values: otp,
//         numbers: mobile,
//       },
//       {
//         headers: { authorization: "YOUR_FAST2SMS_API_KEY" },
//       }
//     );

//     console.log("OTP sent:", otp);
//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("OTP Send Error:", error.response?.data || error.message);
//     res.status(500).json({ success: false, message: "Failed to send OTP" });
//   }
// };

// exports.sendOtp = async (req, res) => {
//   const { mobile } = req.body;

//   // Basic validation
//   if (!mobile || mobile.length !== 10) {
//     return res.status(400).json({ success: false, message: "Invalid mobile number" });
//   }

//   // Generate OTP
//   const otp = Math.floor(100000 + Math.random() * 900000);
//   otpStore[mobile] = otp;

//   try {
//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "otp",
//         variables_values: otp,
//         numbers: mobile,
//       },
//       {
//         headers: { authorization: "I2q1AYdoBf9H6gmUMwkbETpxctVrDQNzXlG0hJe84Lsn7a5FyilCg5hbRe0Irp1qZ8HoQVELdnGPjD7U" },
//       }
//     );

//     console.log("OTP sent:", otp);

//     // Render verify.ejs and pass the mobile number
//     res.render("auth/verify", { mobile, message: "OTP sent successfully" });

//   } catch (error) {
//     console.error("OTP Send Error:", error.response?.data || error.message);
//     res.status(500).json({ success: false, message: "Failed to send OTP" });
//   }
// };


// exports.verifyOtp = (req, res) => {
//   const { mobile, otp } = req.body;

//   if (otpStore[mobile] && otpStore[mobile] == otp) {
//     delete otpStore[mobile];
//     return res.json({ success: true, message: "OTP verified successfully" });
//   }

//   res.status(400).json({ success: false, message: "Invalid or expired OTP" });
// };





