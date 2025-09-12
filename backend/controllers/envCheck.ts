const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("ALERT_EMAIL:", process.env.ALERT_EMAIL);
console.log("ALERT_EMAIL_PASSWORD:", process.env.ALERT_EMAIL_PASSWORD);
