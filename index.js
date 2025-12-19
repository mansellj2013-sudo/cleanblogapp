import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

import { showRegister, storeUser } from "./controllers/authController.js";
import { showLogin, loginUser, logout } from "./controllers/loginController.js";
import { showEdit, updatePost } from "./controllers/editPostController.js";
import { deletePost } from "./controllers/deletePostController.js";
import { showSearch, searchPosts } from "./controllers/searchController.js";
import Image from "./models/Image.js";

mongoose.connect(process.env.MONGODB_URI);

const app = new express();

import fileUpload from "express-fileupload";

import newPostController from "./controllers/newPost.js";

import homeController from "./controllers/home.js";

import storePostController from "./controllers/storePost.js";

import getPostController from "./controllers/getPost.js";

import validateMiddleWare from "./middleware/validate.js";
import { isAuthenticated, isNotAuthenticated } from "./middleware/auth.js";
import notFoundController from "./controllers/notFound.js";
import { initializeGateway } from "./config/gateway.js";

app.set("view engine", "ejs");

// set static folders and middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (
    req.method === "POST" ||
    req.path.includes("login") ||
    req.path.includes("register")
  ) {
    console.log(
      `[REQUEST] ${req.method} ${req.path} - Body keys: ${Object.keys(
        req.body
      ).join(", ")}`
    );
  }
  next();
});

app.use(fileUpload());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      autoRemove: "interval",
      autoRemoveInterval: 10, // remove expired sessions every 10 minutes
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    },
  })
);
app.use("/posts/store", validateMiddleWare);

// listen on port from environment variable or default to 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Authentication routes
app.get("/register", isNotAuthenticated, showRegister);
app.post("/register", isNotAuthenticated, storeUser);
app.get("/login", isNotAuthenticated, showLogin);
app.post("/login", isNotAuthenticated, loginUser);
app.get("/logout", logout);

// home page route displaying all blog posts on home page
app.get("/", homeController);

// Route for individual blog post
app.get("/post/:id", getPostController);

// Route to display new post creation form
app.get("/posts/new", isAuthenticated, newPostController);

// Route to handle blog post creation
app.post(
  "/posts/store",
  isAuthenticated,
  validateMiddleWare,
  storePostController
);

// Routes for editing and deleting posts
app.get("/posts/:id/edit", isAuthenticated, showEdit);
app.post("/posts/:id/update", isAuthenticated, updatePost);
app.post("/posts/:id/delete", isAuthenticated, deletePost);

// Search routes
app.get("/search", isAuthenticated, showSearch);
app.post("/search", isAuthenticated, searchPosts);

// Image serving route
app.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).send("Image not found");
    }
    res.set("Content-Type", image.contentType);
    res.send(image.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving image");
  }
});

// Initialize gateway to second application
initializeGateway(app);

// Catch-all route for 404 errors (must be at the end)
app.use(notFoundController);
