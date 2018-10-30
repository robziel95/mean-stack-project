const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

const app = express();
// EnyhIPVvwPUkeqeE
mongoose.connect(
  //"mongodb+srv://robz:EnyhIPVvwPUkeqeE@cluster0-zpzps.mongodb.net/node-angular?retryWrites=true"
  "mongodb://localhost:27017/meanstack"
  )
.then(
  () => {
    console.log("connected to database");
  }
)
.catch(
  () => {
    console.log("connection failed");
  }
);

app.use(bodyParser.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  //allow to read resources fromm all origins
  res.setHeader("Access-Control-Allow-Methods",
  "GET, POST, PATCH, PUT, OPTIONS, DELETE"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
