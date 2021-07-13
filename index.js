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
  .connect(
    "mongodb+srv://allhambra10594:Gb5zEMijtdGybMkb@smcluster.2lhkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB...."))
  .catch((err) => console.error("Could not connect to MongoDB...."));

let port = process.env.PORT || 3000;

// 1. Create User
app.post("/api/users", async (req, res) => {
  var token = randtoken.generate(16);
  let { name, email, password } = req.body;
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  let plainPassword = password;
  let user = new User({
    name: name,
    email: email,
    password: password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  // let encoded = btoa(`{${user.name}:${user.password}}`);
  let encoded = Buffer.from(`{${user.name}:${plainPassword}}`).toString(
    "base64"
  );

  try {
    await user.save();
    res
      .header("authorization", `Basic ${encoded}`)
      .send(_.pick(user, ["_id", "name", "email"]));
  } catch (ex) {
    res.send(ex);
  }
});

// 2. Authenticate User
app.post("/api/auth", async (req, res) => {
  // Decode Base64 from the header authorization
  let str = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  ).toString();
  let decoded = str.replace(/^{(.*)}$/, "$1");
  let name = decoded.split(":")[0];
  let password = decoded.split(":")[1];

  // console.log(name);
  let user = await User.findOne({ name: name });

  if (!user) return res.status(400).send("Invalid username or password.");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  let token = jwt.sign({ name: name }, "IshouldbeinENVfile");
  res.send(token);
});

// 3. Retrieve Single User
app.get("/api/users/:_id", auth, async (req, res) => {
  // the auth middleware will check the authorization of user
  const user = await User.findById(req.params._id);

  if (!user)
    return res.status(404).send("The User with the given ID was not found.");

  res.send(_.pick(user, ["_id", "name", "email"]));
});

// 4. Retrieve All Users
app.get("/api/users", auth, async (req, res) => {
  // the auth middleware will check the authorization of user
  const users = await User.find().select("-password");
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

  const updated = await User.updateOne({ name: user.name }, { $set: user });

  res.send(_.pick(updated, ["_id", "name", "email"]));
});
app.listen(port, () => {
  console.log("Server is started at " + port);
});
