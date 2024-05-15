"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const uitls_1 = require("./utils/uitls");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
// Middleware to set dynamic headers based on received App ID
app.use((req, res, next) => {
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
app.post('/accesstoken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //get the input data from req.body
    const { deviceId, appId, appSecret, refreshToken } = req.body;
    // create sign
    function createSign(appSecret, message) {
        return crypto_js_1.default.enc.Base64.stringify(crypto_js_1.default.HmacSHA256(message, appSecret));
    }
    const rt = refreshToken;
    const message = JSON.stringify({ rt: refreshToken });
    let sign = createSign(appSecret, message);
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
    const response = yield axios_1.default.post(`https://eu-apia.coolkit.cc/v2/user/refresh`, requestBody, { headers });
    // Implement your logic based on the device action
    // You can access the received headers using res.locals.headers
    console.log(response.data);
}));
// Define a wrapper function for the cron job
let refreshParams = null;
// Middleware to set dynamic headers based on received App ID
app.use((req, res, next) => {
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
node_cron_1.default.schedule('0 0 1 */29 * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!refreshParams) {
            console.error("Dynamic parameters not set.");
            return;
        }
        console.log("Refreshing access token...");
        const { appId, appSecret, refreshToken } = refreshParams;
        const result = yield (0, uitls_1.refreshAccessToken)({ appId, appSecret, refreshToken });
        console.log(result);
        console.log("Access token refreshed successfully!");
    }
    catch (error) {
        console.error("Error occurred while refreshing access token:", error);
    }
}), {
    scheduled: true,
    timezone: "UTC"
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map