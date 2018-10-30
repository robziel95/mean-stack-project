const express = require("express");
const multer = require("multer");
//multer extracts files like body parser extracts json
const Post = require('../models/post');
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const MIME_TYPE_MAP = {
  //extract input file extension
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null; //do not throw error
    }
    //cb - callback
    cb(error, "backend/images");
    //path relative to server.js file
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
});

//npm install --save body-parser
router.post("",
  checkAuth,
  multer({storage: storage})
  .single("image"), (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      //Id of user passed from check-auth with response from checkAuth
      creator: req.userData.userId
    });

    post.save().then(createdPost => {
      res.status(201).json({
        message: 'Post added successfully',
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath
        }
      });
    }).catch(
      error => {
        res.status(500).json({
          message: "Creating a post failed!"
        });
      }
    );
});
//patch is also possibe to use, in order to update
router.put("/:id",
checkAuth,
multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath: url + "/images/" + req.file.filename
  }
  const post = new Post ({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  console.log(post);
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
    if (result.nModified > 0){
      res.status(200).json({message: 'Update successful!'});
    }else{
      res.status(401).json({message: 'Not authorized!'});
    }

  })
  .catch(
    error => {
      res.status(500).json({
        message: "Couldn't update post!"
      });
    }
  )
});

router.get('', (req, res, next) => {
  //req.query;//those are parameters send in url after "?" sign, each parameter is separated by &
  const pageSize = +req.query.pagesize;//we retrieve value from query named pageSize, if we dont pass it, its value will be undefined
  const currentPage = Number(req.query.page); //+ at the begginning cats to number, same as Number method
  const postQuery = Post.find();
  //postQuery will be executed after we call then
  let fetchedPosts;
  if (pageSize && currentPage){
    //if we get parameters, we modify postQuery
    postQuery
    .skip(pageSize * (currentPage - 1)) //skip first n elements
    .limit(pageSize); //display only declared amount of items

  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(
      count => {
        res.status(200).json({
          message: 'Posts fetched succesfully',
          posts: fetchedPosts,
          maxPosts: count
        })
      }
    ).catch(
      error => {
        res.status(500).json({
          message: "Fetching post failed!"
        });
      }
    );
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not fount!'});
    }
  }).catch(
    error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    }
  );
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId}).then(
    result => {
      if (result.n > 0){
        res.status(200).json({message: 'Post deleted!'});
      }else{
        res.status(401).json({message: 'Not authorized!'});
      }
    }
  ).catch(
    error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    }
  );
});

module.exports = router;
