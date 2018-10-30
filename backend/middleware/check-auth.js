const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // token will be in a format of: "Bearer okapkidakijcl" so we split it by the white space, 1 is second word
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret_this-should_be_longer");
    //send user Id to next middleware together with response
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch(error) {
    res.status(401).json({ message: "Auth failed!" });
  }
  //To add middleware to app, it needs to be added in app module

}
