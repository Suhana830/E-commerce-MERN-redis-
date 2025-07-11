import jwt from "jsonwebtoken";
import User from '../models/User.model.js'

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            return res.status(401).json({ message: "Unauthorized - No token provided" })

        try {

            const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decode.userId).select("-password");

            if (!user)
                return res.status(401).json({ message: "User not found" })


            req.user = user;
            next();

        } catch (error) {
            if (error.name === "TokenExpiredError")
                return res.status(401).json({ message: "Unauthorized -Access token expired" })

            throw error;

        }
    } catch (error) {
        console.log("Error in middleware auth", error.message);
        res.status(500).json({ message: error.message });

    }
}

export const adminRoute = (req, res, next) => {

    if (req.user && req.user.role === "admin")
        next();
    else {
        return res.status(401).json({ message: "Access denied -Admin Only" })

    }


}