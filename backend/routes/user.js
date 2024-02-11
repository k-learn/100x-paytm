import express from 'express';
import { z } from 'zod';
import { User } from '../db.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware.js';
import { JWT_SECRET } from '../config.js';

const router = express.Router();

const signupBody = z.object({
    username: z.string().email(),
    firstName: z.string().max(50),
    lastName: z.string().max(50),
    password: z.string().min(6),
});

router.post("/signup", async (req, res) => {

    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Email already taken / Incorrect inputs" });
    }
    
    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(411).json({ message: "Email already taken / Incorrect inputs" });
    }

    const newUser = await User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
    });

    const userId = newUser._id;
    const token = jwt.sign({ userId, }, JWT_SECRET);

    return res.status(200).json({
        message: "User created successfully",
        token: token,
    });
});

const signinBody = z.object({
    username: z.string().email(),
    password: z.string().min(6),
});

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Error while logging in" });
    }
    
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    });

    if (!user) {
        return res.status(411).json({ message: "Error while logging in" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    return res.status(200).json({
        token: token,
    });

});

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Error while updating information" });
    }

    await User.updateOne(req.body, { _id: req.userId });

    return res.json({ message: "Updated successfully" });
});

router.get("/bulk", authMiddleware, async (req, res) => {
    const query = req.query.filter;
    
    const data = await User.find({
        $or: [{
            firstName: {
                "$regex": query,
                "$options": 'i',
            },
        }, {
            lastName: {
                "$regex": query,
                "$options": 'i',
            },
        }],
    });

    return res.json({
        users: data.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        })),
    }); 
});

export default router;
