const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define the path to the .env file
const envPath = path.join(process.cwd(), '.env');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Define the content of the .env file
const envContent = `PORT=5000
MONGODB_URI=mongodb+srv://crmcmt:crmcmt12@crm.ct8puzi.mongodb.net/?retryWrites=true&w=majority&appName=CRM
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=30d
NODE_ENV=development`;

// Write the content to the .env file
fs.writeFileSync(envPath, envContent);

console.log('.env file created successfully with a secure JWT secret.'); 