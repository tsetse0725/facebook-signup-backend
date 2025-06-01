const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(require("cors")());

const readUsers = async () => {
  try {
    const data = await fs.promises.readFileSync("users.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users.json:", err);
    return [];
  }
};

const writeUsers = async (data) => {
  await fs.writeFileSync("users.json", JSON.stringify(data, null, 2));
};

app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, birthDate, gender, email, phone, password } =
      req.body;

    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const users = await readUsers();
    const exists = users.find((u) => u.email === email);

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
    await writeUsers(users);

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("POST/users error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Login and password required" });
    }

    const users = await readUsers();

    const user = users.find(
      (u) => (u.email === login || u.phone === login) && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("POST/login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  const users = await readUsers();
  res.json(users);
});

app.get("/email/:email", async (req, res) => {
  const users = await readUsers();
  const user = users.find((u) => u.email === req.params.email);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.put("/emails/:email", async (req, res) => {
  const users = await readUsers();
  const index = users.findIndex((u) => u.email === req.params.email);
  if (index === -1) return res.status(404).json({ message: "user not found" });

  users[index] = { ...users[index], ...req.body, email: users[index].email };
  await writeUsers(users);
  res.json({ message: "User updated", user: users[index] });
});

app.delete("/delete/:email", async (req, res) => {
  const users = await readUsers();
  const newUsers = users.filter((u) => u.email !== req.params.email);
  if (newUsers.length === users.length)
    return res.status(404).json({ message: "User not found" });

  await writeUsers(newUsers);
  res.json({ message: "User deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running at  http://localhost:${PORT}`);
});
