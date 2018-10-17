const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Post = require('./models/post');
const app = express();
// EnyhIPVvwPUkeqeE
mongoose.connect("mongodb+srv://robz:EnyhIPVvwPUkeqeE@cluster0-zpzps.mongodb.net/node-angular?retryWrites=true")
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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //allow to read resources fromm all origins
  res.setHeader("Access-Control-Allow-Methods",
  "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

//npm install --save body-parser
app.post("/api/posts", (req, res, next) => {

  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      postId: createdPost._id
    });
  });
});

app.get('/api/posts', (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: 'Posts fetched succesfully',
      posts: documents
    });
  });
})

app.delete("/api/posts/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(
    result => {
      console.log(result);
      res.status(200).json({message: 'Post deleted!'});
    }
  )
});

module.exports = app;
