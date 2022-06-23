const serviceAccount = require("../google-credentials.json");
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
    storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
  });
  const db = fs.firestore();
  const bucket = fs.storage().bucket();
  const tasklist = tasklistCollection = db.collection("tasklist");
  const users = usersCollection = db.collection('users');

  const uploadFile = async (taskId, file) => {
    console.log("starting upload")

    const blob = bucket.file('proof/' + file.originalname)
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
            metadata: { 'proof': taskId }
        }
    });
    blobWriter.on('error', (err) => {
        console.log(err)
    });
    blobWriter.on('finish', () => {
        console.log('Finished uploading')
    })
    blobWriter.end(file.buffer)

    //
    blob.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    })
    .then(signedUrls => {
      // signedUrls[0] contains the file's public URL
      const signedURL = signedUrls[0]
      console.log(`TASK: ${taskId} / URL: ${signedURL}`)
      return signedURL
    })
    .catch((err) => console.log(err));
};


module.exports = {
  tasklist,
  users,
  bucket,
  uploadFile
}