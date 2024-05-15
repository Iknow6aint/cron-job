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
exports.refreshAccessToken = exports.createSign = void 0;
const axios_1 = __importDefault(require("axios"));
function createSign(appSecret, message) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, appSecret));
}
exports.createSign = createSign;
// Controller function to refresh access token
function refreshAccessToken(reqBody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { appId, appSecret, refreshToken } = reqBody;
            // Construct the message for signature calculation
            const message = JSON.stringify({ rt: refreshToken });
            // Calculate the signature
            const sign = createSign(appSecret, message);
            // Construct the headers
            const headers = {
                'X-CK-Appid': appId,
                'X-CK-Nonce': 'DfQNAufZ', // You can generate a nonce here if needed
                'Authorization': `Sign ${sign}`,
                'Content-Type': 'application/json'
            };
            // Construct the request body
            const requestBody = {
                rt: refreshToken
            };
            // Make the API call
            const response = yield axios_1.default.post(`https://eu-apia.coolkit.cc/v2/user/refresh`, requestBody, { headers });
            // Return the response data
            return response.data;
        }
        catch (error) {
            // Handle errors
            console.error("Error:", error);
            throw error; // Rethrow the error or handle it as needed
        }
    });
}
exports.refreshAccessToken = refreshAccessToken;
//# sourceMappingURL=uitls.js.map