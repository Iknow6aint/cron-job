import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import CryptoJS from 'crypto-js';
import axios from 'axios'
import cron from 'node-cron';
import { refreshAccessToken } from './utils/uitls';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Middleware to set dynamic headers based on received App ID
app.use((req: Request, res: Response, next) => {
    const { deviceId, appId, appSecret } = req.body;

    if (!appId || !appSecret) {
        return res.status(400).json({ error: 'Device ID, App ID, and App secret are required' });
    }

    // Set the Coolkit API headers dynamically
    res.locals.headers = {
        'X-CK-Appid': appId,
        'X-CK-Nonce': '{{nonce}}',
        'Authorization': `Sign ${appSecret}`,
        'Content-Type': 'application/json'
    };

    next();
});

// Endpoint to handle device-specific actions
app.post('/accesstoken', async (req: Request, res: Response) => {
    //get the input data from req.body
    const { deviceId, appId, appSecret, refreshToken } = req.body;

    // create sign

    function createSign(appSecret: string, message: string): string {
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, appSecret));
    }

    const rt = refreshToken
    const message = JSON.stringify({ rt: refreshToken });

    let sign = createSign(appSecret, message)
    //console.log(sign);

    const headers = {
        'X-CK-Appid': appId,
        'X-CK-Nonce': 'DfQNAufZ',
        'Authorization': `Sign ${sign}`,
        'Content-Type': 'application/json'
    };
    const requestBody = {
        rt // You may need to adjust this depending on how you get the refresh token
    };
    const response = await axios.post(`https://eu-apia.coolkit.cc/v2/user/refresh`, requestBody, { headers });
    // Implement your logic based on the device action
    // You can access the received headers using res.locals.headers

    console.log(response.data);


});

// Define a wrapper function for the cron job
let refreshParams: { appId: string, appSecret: string, refreshToken: string } | null = null;

// Middleware to set dynamic headers based on received App ID
app.use((req: Request, res: Response, next) => {
    const { appId, appSecret, refreshToken } = req.body;

    if (!appId || !appSecret || !refreshToken) {
        return res.status(400).json({ error: 'App ID, App secret, and Refresh token are required' });
    }

    // Set the dynamic parameters in the shared context
    refreshParams = {
        appId,
        appSecret,
        refreshToken
    };

    next();
});

// Schedule the refresh token API call to run every 29 days
cron.schedule('0 0 1 */29 * *', async () => {
    try {
        if (!refreshParams) {
            console.error("Dynamic parameters not set.");
            return;
        }

        console.log("Refreshing access token...");
        const { appId, appSecret, refreshToken } = refreshParams;
        const result = await refreshAccessToken({ appId, appSecret, refreshToken });
        console.log(result);

        console.log("Access token refreshed successfully!");
    } catch (error) {
        console.error("Error occurred while refreshing access token:", error);
    }
}, {
    scheduled: true,
    timezone: "UTC"
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});