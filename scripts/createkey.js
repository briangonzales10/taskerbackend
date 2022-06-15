require("dotenv").config();
const path =require('path');
const fs = require('fs');

const serviceKey = {
    "type": "service_account",
    "project_id": `${process.env.PROJECT_ID}`,
    "private_key_id": `${process.env.PRIVATE_KEY_ID}`,
    "private_key": `${process.env.PRIVATE_KEY}`,
    "client_email": `${process.env.CLIENT_EMAIL}`,
    "client_id": `${process.env.CLIENT_ID}`,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": `${process.env.CLIENT_URL}`
  }
const filepath = path.join(__dirname, '..', 'resources', 'taskerdb-11614-firebase-adminsdk-81hw6-6e2a2a8d25.json')
const data = JSON.stringify(serviceKey, 2, null);

fs.writeFileSync(filepath, data, (err) => {
    if (err) throw err;
    console.log('created private key successfully!')
});