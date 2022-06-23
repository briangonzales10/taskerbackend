const serviceAccount = require("../google-credentials.json");
const fs = require("firebase-admin");
const post = require('../service/postService')


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

  exports.uploadFile = async function uploadFile(taskId, file) {
    console.log("starting upload")
    const res = {
        'status': 200,
        'message': '',
        'signedURL': ''
    }
    const blob = bucket.file('proof/' + file.originalname)
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
            metadata: { 'proof': taskId }
        }
    });
    blobWriter.on('error', (err) => {
        console.log(err)
        res.status = 500
        res.message = `File could not be uploaded for task Id: ${taskId}`
    });
    blobWriter.on('finish', (result) => {
        
        res.status = 200
        res.message = `File uploaded for task Id: ${taskId}` 
        console.log(res.message)
    })
    blobWriter.end(file.buffer)
    file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    }).then(signedUrls => {
      // signedUrls[0] contains the file's public URL
      res.signedURL = signedUrls[0]
      post.updateProof(taskId, res.signedURL)
    });
    return res;
};


module.exports = {
  tasklist,
  users,
  bucket
}