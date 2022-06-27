const serviceAccount = require("../google-credentials.json");
const fs = require("firebase-admin");

const { initializeApp, applicationDefault, cert } = require("firebase-admin/app")
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const { reject } = require("firebase-tools/lib/utils");

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

  let results = {
    status: '',
    message: '',
  }
  let successFlag = false;
  const fileName = file.originalname
  const blob = bucket.file('proof/' + fileName);
  const promise = new Promise((resolve, reject) => {
    const blobWriter = blob.createWriteStream({
      metadata: {
          contentType: file.mimetype,
          metadata: { 'proof': taskId }
      }
    });
    blobWriter.on('error', (err) => {
      results.status = 500;
      results.message = `Could not upload file!`;
      reject(results);
      console.log(err)
    });
    blobWriter.on('finish', () => {
      successFlag = true;
      results.status = 200;
      results.message = `Finished uploading ${fileName}!`;
      
      resolve(results);
      console.log(results.message);
    })
    blobWriter.end(file.buffer, () => {
      if (results.status == 200) {
      blob.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        }).then(signedURLs => {
        updateProof(taskId, fileName, signedURLs[0]);
      })
      }
    });
  })
  return promise;
};

function updateProof(taskId, fileName, signedURL) {
  console.log(`Updating Proof Filename for ${taskId}`)
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

async function findUserFromTaskId(taskId) {
  return new Promise ((resolve, reject) => {
    let submitUserId = ''
    let taskName = ''
    let task = tasklist.doc(taskId).get();
    task.then((res) => {
      console.log(`task for email: ${res.data()}`)
      data = res.data();
      submitUserId = data.submittedBy;
      taskName = data.taskname;
      console.log("data for email" + submitUserId + taskName)
    })
    .then( () => {
      let submitUser = users.doc(submitUserId).get();
      submitUser.then((res) => {
        userDataRes = res.data();
        if (userDataRes != null) {
          let userData = {
            displayName: userDataRes.displayName,
            emailAddress: userDataRes.emailAddress,
            taskName: taskName
          }
          console.log(`submitUser Res data: ${userData.displayName}, ${userData.emailAddress}`);
        resolve(userData);
        }
      })
      .catch( (err) => {
        console.log('Get Submit User error: ' + err)
      })
    })
    .catch( (err) => {
      console.log('Get task error: ' + err);
      reject()
    })
  })
}

module.exports = {
  tasklist,
  users,
  bucket,
  uploadFile,
  Timestamp,
  FieldValue,
  findUserFromTaskId
}