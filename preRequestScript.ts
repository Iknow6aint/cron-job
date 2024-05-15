// Import CryptoJS library for HMAC SHA256 encryption
const CryptoJS = require('crypto-js');

// Function to create HMAC SHA256 signature
function createSign(appsecret, message) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, appsecret));
}

// Extract app secret and refresh token from request body
const appsecret = pm.variables.get("appSecret");
const rt = pm.request.body.raw;

// Convert request body to JSON object
const requestBody = JSON.parse(rt);

// Generate sign based on the content of the request body
let sign;

if (requestBody.rt === pm.variables.get("refreshToken")) {
    const message = JSON.stringify({ rt });
    console.info(message);
    sign = createSign(appsecret, message);
} else {
    sign = createSign(appsecret, rt);
}

// Set the generated sign as an environment variable
pm.environment.set('sign', sign);