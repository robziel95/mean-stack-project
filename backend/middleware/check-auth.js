const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // token will be in a format of: "Bearer okapkidakijcl" so we split it by the white space, 1 is second word
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "secret_this-should_be_longer");
    next();
  } catch(error) {
    res.status(401).json({ message: "Auth failed!" });
  }
  //To add middleware to app, it needs to be added in app module

}
