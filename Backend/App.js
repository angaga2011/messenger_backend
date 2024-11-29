import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "messenger";
const app = express();
const Port = 3000;

app.use(express.json());

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const Auth = db.collection("user");
        return { Auth };
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); // Exit process on failure
    }
}

function AuthToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(400).json({ message: "Invalid token." });
    }
}

async function serverAuth() {
    const { Auth } = await connectDB();

    app.post("/register", async (req, res) => {
        try {
            const { username, password, email } = req.body;

            if (!username || !password || !email) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Check if the username or email already exists
            const existingUser = await Auth.findOne({
                $or: [{ username }, { email }],
            });

            if (existingUser) {
                return res.status(409).json({ message: "Username or email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await Auth.insertOne({ username, password: hashedPassword, email });

            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ message: "An error occurred during registration" });
        }
    });

    app.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await Auth.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "Invalid username or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid username or password" });
            }

            const token = jwt.sign(
                { username: user.username, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: "An error occurred during login" });
        }
    });

    app.get("/api/dashboard", AuthToken, (req, res) => {
        res.json({ message: "Welcome to the dashboard", user: req.user });
    });

    app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });
}

serverAuth();
