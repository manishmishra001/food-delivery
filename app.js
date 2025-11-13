const path = require('path');
// External Modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require("multer");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);



const app = express();

// Internal Modules
const storeRouter = require('./routes/storeRouter');
const hostRouter = require("./routes/hostRouter");
const cartRouter = require("./routes/cartRouter");
const authRouter = require("./routes/authRouter");


const mongoUri = "mongodb+srv://manish1525t_db_user:royalpanda123@royalpanda.yg0sjwc.mongodb.net/?retryWrites=true&w=majority&appName=royalpanda";

const store = new MongoDBStore({
  uri: mongoUri,
  collection : 'session'
}) 

// Middleware to serve static files and parse request body
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
  secret: "yoursecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));


// app.use((req, res, next) => {
//   req.isloggedIn =  req.session.isloggedIn;
//   next();
// });


app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user ? req.session.user.role === "admin" : false;
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  next();
});



// Set view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));
app.use('/uploads', express.static('uploads'));


// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Generate random string for file names
const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Ensuring file names are unique and safe
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Reject non-image files
    cb(null, false);
  }
};

// Apply multer middleware globally for single 'photo' field
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('photo')); 
app.use('/uploads', express.static('uploads'));




// Routes
app.use("/auth", authRouter);
app.use(storeRouter);
app.use("/host", hostRouter);
app.use(cartRouter);
app.get('/login', (req, res) => {
  res.render('auth/login',{
     cartCount: 0,
        errors: [],
        oldInput: { mobile: "" },
  }); // Make sure you have views/auth/login.ejs
});

// MongoDB connection and server start
const PORT = 3001;
// Replace with actual connection string securely in a real app

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.log('Error while connecting to MongoDB: ', err));
