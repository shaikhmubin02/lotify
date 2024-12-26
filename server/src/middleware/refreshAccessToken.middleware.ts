import express from "express";
import axios from "axios";

//middlerware for refreshing access token
export const refreshAccessToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { token } = req.cookies;

        // If there is a token, proceed to next middleware
        if (token) {
            return next();
        }

        // If no token, get a new one
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.CLIENT_ID || '');
        params.append('client_secret', process.env.CLIENT_SECRET || '');

        const response = await axios.post("https://accounts.spotify.com/api/token", 
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Set the token in cookie and proceed
        res.cookie("token", response.data.access_token, { 
            maxAge: 58*60*1000, 
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: '.vercel.app'
        });

        // Store token in request for this request cycle
        req.cookies.token = response.data.access_token;
        
        return next();

    } catch (error) {
        console.log("refreshAccessToken error:", error);
        return res.status(500).json({ 
            message: "Error refreshing access token", 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}