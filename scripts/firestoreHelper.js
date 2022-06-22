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
    storageBucket: `${process.env.PROJECT_ID}.appspot.com`
  });
  const db = fs.firestore();
  const bucket = fs.storage().bucket();
  const remotePath = '/uploads/proof'


  exports.putFile = async function putFile(taskId, pathTofilename) {
    const fileMime = mime.lookup(pathTofilename);

    var myMetadata = {
      contentType: fileMime
    };
    return bucket.upload(pathTofilename, {
      destination: remotePath,
      uploadType: "media",
      metadata : myMetadata,
      'proof': taskId
    })
    .then((data) => {
      let file = data[0]
      return Promise.resolve(`https://firebasestorage.googleapis.com/v0/b/` + bucket.name + "/o/" + file.name)
    })
    .catch((err) => console.log(err));
  }

  exports.tasklist = tasklistCollection = db.collection("tasklist");
  exports.users =  usersCollection = db.collection('users');

