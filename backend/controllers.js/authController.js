import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

import { redis } from '../lib/redis.js'

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",

    })

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "15m",

    });

    return { accessToken, refreshToken }
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,  // prevent xss attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevent CSRF(cross-site request forgery) attack
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  // prevent xss attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevent CSRF(cross-site request forgery) attack
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

}




const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "Ex", 7 * 24 * 60 * 60); //7days
}

export const signup = async (req, res) => {

    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
        return res.status(400).json({ message: "User already exists" })

    const user = await User.create({ name, email, password });

    //authentication
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }, message: "user created successfully ! "
    })

}

export const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }

}

export const logout = async (req, res) => {

    try {
        const refreshToken = req.cookies["refreshToken"];

        if (refreshToken) {
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken${decode.userId}`);
        }

        res.clearCookie("accessToekn");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully " });

    } catch (error) {

        console.log(error);

        res.status(500).json({ message: "server Error" })
    }

}

export const refreshToken = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken)
            return res.status(401).json({ message: "No refresh token provided" });

        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decode.userId}`);

        if (storedToken !== refreshToken)
            return res.status(401).json({ message: "Invalid refresh token" });

        const accessToken = jwt.sign({ userId: decode.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",

        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,  // prevent xss attacks
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",//prevent CSRF(cross-site request forgery) attack
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully" })

    } catch (error) {
        console.log("Error in refresh controller", error.message);
        res.status(500).json({ message: error.message });

    }
}

export const getProfile = async (req, res) => {

    try {

        res.json(req.user)
    } catch (error) {
        console.log("Error in profile controller", error.message);
        res.status(500).json({ message: error.message });

    }
}