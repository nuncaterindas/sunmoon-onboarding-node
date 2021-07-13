const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const str = req.headers["authorization"];
  //   this will remove the quotation in string
  let encoded = str.replace(/^"(.*)"$/, "$1");

  if (!encoded)
    return res.status(401).send("Access denied. No token provided.");
  let token = encoded.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "IshouldbeinENVfile");
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
