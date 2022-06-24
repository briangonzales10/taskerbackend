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

let uploadFile = async (taskId, file) => {
  console.log("starting upload")

  const results = {
    status: '200',
    message: 'trying'
  }
  const successFlag = false;
  const fileName = file.originalname
  const blob = bucket.file('proof/' + fileName)
  const blobWriter = blob.createWriteStream({
      metadata: {
          contentType: file.mimetype,
          metadata: { 'proof': taskId }
      }
  });
  blobWriter.on('error', (err) => {
    results.status = 500
    results.message = `Could not upload file!`
    console.log(err)
  });
  blobWriter.on('finish', () => {
    console.log('Finished uploading');
    successFlag = true;
    results.status = 200;
    results.message = `Finished uploading ${fileName}!`;
  })
  blobWriter.end(file.buffer);
  if (successFlag == true) {
    updateProof(taskId, fileName, blob.getSignedUrl());
  }
  return results
};

function updateProof(taskId, fileName, signedURL) {
  console.log(`Updating Proof Filename for ${taskId}`)
  console.log(`URL: ${signedURL}`)
  tasklist.doc(taskId).update({
    proof : {
      filename: fileName,
      proofURL: signedURL
    }
  })
  .then((res) => {
    console.log(res)
  })
  .catch((err) => console.log(err))
}

module.exports = {
  tasklist,
  users,
  bucket,
  uploadFile
}