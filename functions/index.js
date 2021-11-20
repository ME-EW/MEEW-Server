const admin = require("firebase-admin");
const serviceAccount = require("./sopt-hackathon-firebase-adminsdk-la7h1-2838a71b76");
const dotenv = require("dotenv");

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

module.exports = {
  api: require("./api"),
};