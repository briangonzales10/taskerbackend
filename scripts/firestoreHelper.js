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
    console.log('Finished uploading')
    results.status = 200
    results.message = `Finished uploading ${fileName}!`
    updateProof(taskId, fileName)
  })
  blobWriter.end(file.buffer)
  return results
};

function updateProof(taskId, fileName) {
  console.log(`Updating Proof Filename for ${taskId}`)
  
  tasklist.doc(taskId).update({
    proofFilename : fileName
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