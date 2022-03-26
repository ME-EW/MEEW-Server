const admin = require('firebase-admin');
const serviceAccount = require('./we-sopt-29-server-firebase-adminsdk-xbekl-32821e105a');
const dotenv = require('dotenv');

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
  api: require('./api'),
};
