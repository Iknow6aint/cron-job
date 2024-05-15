import axios from "axios";

export function createSign(appSecret: string, message: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, appSecret));
}

// Controller function to refresh access token
export async function refreshAccessToken(reqBody: any) {
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
        const response = await axios.post(`https://eu-apia.coolkit.cc/v2/user/refresh`, requestBody, { headers });

        // Return the response data
        return response.data;
    } catch (error) {
        // Handle errors
        console.error("Error:", error);
        throw error; // Rethrow the error or handle it as needed
    }
}
