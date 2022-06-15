const serviceAccount = require("../resources/taskerdb-11614-firebase-adminsdk-81hw6-6e2a2a8d25.json");
const fs = require("firebase-admin");

const {
    initializeApp,
    applicationDefault,
    cert,
  } = require("firebase-admin/app");
  const {
    getFirestore,
    Timestamp,
    FieldValue,
  } = require("firebase-admin/firestore");

  //Open DB connection
fs.initializeApp({
    credential: fs.credential.cert(serviceAccount),
  });
  const db = fs.firestore();

  exports.tasklist = tasklistCollection = db.collection("tasklist");
  exports.users =  usersCollection = db.collection('users')