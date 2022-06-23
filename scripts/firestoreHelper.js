const serviceAccount = require("../google-credentials.json");
const fs = require("firebase-admin");
var mime = require('mime-types')


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
    storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
  });
  const db = fs.firestore();
  const bucket = fs.storage().bucket();
  const remotePath = '/uploads/proof'
  const tasklist = tasklistCollection = db.collection("tasklist");
  const users = usersCollection = db.collection('users');


module.exports = {
  tasklist,
  users,
  bucket
}