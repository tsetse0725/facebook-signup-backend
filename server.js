const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { parse } = require("path");

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(require("cors")());

const readUsers = () => {
  const data = fs.readFileSync("users.json", "utf-8");
  return JSON.parse(data);
};

const writeUsers = (data) => {
  fs.writeFileSync("users.json", JSON.stringify());
};

app.post("/users", (req, res) => {
  const { firstName, lastName, birthDate, gender, email, phone, password } =
    req.body;

  if (!email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  const users = readUsers();
  const exists = find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }
});
