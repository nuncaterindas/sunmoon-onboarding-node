const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const randtoken = require("rand-token");
const Joi = require("joi");
const auth = require("./middleware/auth");

const { User, validate } = require("./model/user");
const app = express();

app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/Users", { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB...."))
  .catch((err) => console.error("Could not connect to MongoDB...."));

let port = process.env.PORT || 3000;

// 1. Create User
app.post("/api/users", async (req, res) => {
  var token = randtoken.generate(16);
  let { name, email, password } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = new User({
    id: token,
    name: name !== undefined ? req.body.name : null,
    email: email,
    password: password,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // await user.save();
  res.send(_.pick(user, ["_id", "name", "email"]));
});

// 2. Authenticate User
app.post("/api/auth", async (req, res) => {
  // Decode Base64 from the header authorization
  let decoded = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  ).toString();

  let username = decoded.split(":")[0];
  let password = decoded.split(":")[1];
  let user = await User.findOne({ username: username });
  if (!user) return res.status(400).send("Invalid username or password.");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  let token = jwt.sign({ username: username }, "IshouldbeinENVfile");
  res.send(token);
});

// 3. Retrieve Single User
app.get("/api/users/:id", auth, async (req, res) => {
  // the auth middleware will check the authorization of user
  const user = await User.findById(req.params.id);

  if (!user)
    return res.status(404).send("The User with the given ID was not found.");

  res.send(_.pick(user, ["_id", "name", "email"]));
});

// 4. Retrieve All Users
app.get("/api/users", auth, async (req, res) => {
  // the auth middleware will check the authorization of user
  const users = await User.find().select("-__v").sort("name");
  res.send(users);
});

// 5. Update Own Information
app.patch("/api/users", auth, async (req, res) => {
  // the auth middleware will check the authorization of user
  let user = await User.findOne({ username: req.user.username });
  if (!user) return res.status(400).send("Invalid username or password.");

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hash(req.body.password, salt);
  user.name = req.body;
  user.password = hash;

  const updated = await User.updateOne({ _id: user._id }, { $set: user });

  res.send(_.pick(updated, ["_id", "name", "email"]));
});
app.listen(port, () => {
  console.log("Server is started at " + port);
});
