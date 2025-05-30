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

const readUsers = async () => {
  const data = await fs.readFileSync("users.json", "utf-8");
  return JSON.parse(data);
};

const writeUsers = async (data) => {
  await fs.writeFileSync("users.json", JSON.stringify());
};

app.post("/users", async (req, res) => {
  const { firstName, lastName, birthDate, gender, email, phone, password } =
    req.body;

  if (!email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  const users = await readUsers();
  const exists = find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }
  const newUser = {
    id: uuidv4(),
    firstName,
    lastName,
    birthDate,
    gender,
    email,
    phone,
    password,
  };

  users.push(newUser);
  writeUsers(users);
  res.status(201).JSON({ message: "User created", user: newUser });
});

app.get("/user", async (req, res) => {
  const users = await readUsers();
  res.json(users);
});

app.get("/email", async (req, res) => {
  const users = await readUsers();
  const user = users.find((u) => u.email === req.params.email);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});
