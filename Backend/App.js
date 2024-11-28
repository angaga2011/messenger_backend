import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const url = process.env.MONGO_URI; 
const client = new MongoClient(url);
const dbName = "GroupProject";
const app = express();
const Port = 3000;

app.use(express.json());

async function connectDB() {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const Auth = db.collection("Auth");
    return { Auth };
}

async function initializeServer() {
    const { Auth } = await connectDB();

    app.post("/register", async (req, res) => {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Auth.insertOne({ username, password: hashedPassword, email });

        res.status(201).json({ message: "User registered successfully" });
    });

    app.post("/login", async (req, res) => {
        const { username, password } = req.body;

        try {
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
            console.error(error);
            res.status(500).json({ message: "An error occurred during login" });
        }
    });

    function AuthToken(req, res, next) {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
            next();
        } catch (err) {
            return res.status(400).json({ message: "Invalid token." });
        }
    }
    app.get("/api/dashboard",AuthToken, (req,res)=>{
        res.json("welcome to the dashboard")
    })
    app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });
}


initializeServer();
