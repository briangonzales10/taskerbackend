require("dotenv").config();

const express = require("express");
var cors = require("cors");
const fshelper = require("./scripts/firestoreHelper");
const path = require('path')
const fs = require('fs')
const multer = require('multer')


let helper = require("./scripts/helper.js");
let googlePlace = require("./scripts/googlePlace.js");
let getService = require("./service/getService");
let postService = require("./service/postService")

const NO_TASKS = "No Tasks Available!";
const uploadsPath = path.join(__dirname, 'uploads', 'proof')
const upload = multer({
  storage: multer.memoryStorage()
})
const PORT = process.env.PORT || 3000;
var allowlist = ['https://sendtask.me', 'http://sendtask.me', 'http://localhost']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } 
  } else {
    corsOptions = { origin: false } 
  }
  callback(null, corsOptions) 
}

const app = express();
app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`)
});

app.use(upload.single())
app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);


// Get (get all route)
app.get("/tasks/:id", async function (req, res) {

  try {
    let tasks = await getService.getTasks(req.params.id);
    res.status(200).send(tasks);
    console.log("# of All Tasks:" + tasks.length);
  } catch (err) {
    console.warn(err);
    res.status(400).send(NO_TASKS);
  }
});

// Get all tasks for 1 user
app.get("/mytasks/:id", async function (req, res) {

  try {
    let tasks = await getService.getUserTasks(req.params.id);
    res.status(200).send(tasks);
    console.log("# of User Tasks:" + tasks.length);
  } catch (err) {
    console.warn(err);
    res.status(400).send(NO_TASKS);
  }
});

// Task (get single)
app.get("/task/:taskId", async function (req, res) {
  let task;
  console.log(req)
  try {
    task = await getService.getSingleTask(req.params.taskId);

    res.status(200).send(task);
  } catch (err) {
    console.log(err);
    res.status(404).send(`Task not found for task ID: ${req.params.taskId}`);
  }
});

// Add (post)
app.post("/add", async function (req, res) {
  const data = req.body;

  console.log(data);
  console.log(req.body);

  if (
    !data ||
    !data.uid ||
    !data.taskname ||
    !data.location ||
    data.isPublic == null
  ) {
    res.status(400).send("data not valid");
    return;
  }
  try {
    await getService.submitTask(data)

    res.status(200).send(`Thank You! Your task: "${data.taskname}" has been added!`);
  } catch (error) {
    console.warn(error);
    res.status(400).send("task could not be added");
  }
});

// Delete{id} delete route
app.delete("/delete/:taskId", async function (req, res) {
  const taskIdToDelete = req.params.taskId;

  console.log("DELETING TASK: " + taskIdToDelete);
  await fshelper.tasklist.doc(taskIdToDelete).delete();
  res.status(200).send("Task Deleted");
});

// Update Path /update to change status to complete
app.put("/update/:taskId", async function (req, res) {
  const taskIdToUpdate = req.params.taskId;
  const snapshot = await fshelper.tasklist.doc(taskIdToUpdate).get();
  let reqStatusChange = req.body.status;

  let updateStatus = helper.findStatus(reqStatusChange);
  if (updateStatus !== "NONE") {
    await fshelper.tasklist
      .doc(taskIdToUpdate)
      .update({ status: updateStatus });

    res
      .status(200)
      .send(`${snapshot.data().taskname} marked as ${updateStatus}`);
  } else {
    res.status(400).send(`'${req.body.status}' is not a valid status!`);
  }
});

app.post("/places",  async function (req, res) {
  const data = req.body;
  console.log(req);
  console.log(`Searching for: ${data.address}`);
  if (!data) {
    res.status(400).send("Must include address to search");
  } else {
    let results = await googlePlace.findFromAddress(data.address);
    console.log(results);
    res.status(200).send(results);
  }
});

// File Uploading
app.post("/upload/:taskId", upload.single('proof'), async function (req, res) {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  if (!req.params.taskId){
    return res.status(400).send('no task id provided!')
  }

  const result = await postService.uploadFile(req.params.taskId, req.file);

  res.status(result.status).send(result.message)
})

// Get proof of task completion
app.get("/proof/:taskId", async function (req, res) {
  // console.log('Searching for proof')
  // let taskId = req.params.taskId
  // if (!taskId) {
  //   console.log('Searching for proof with no task Id')
  //   return res.status(400).send({'status': 'fail', 'message': 'no task Id Provided'})
  // }

  // let searchFiles = fs.readdirSync(uploadsPath)
  // console.log(`SearchFiles: ${searchFiles}`)

  // searchFiles.find(filename => {
  //   if (filename.includes(taskId)) {
  //     console.log('starting array search')
  //     fullFilePath = path.join(uploadsPath, filename)
  //     console.log(`FilePath Requested: ${fullFilePath}`)
  //     res.status(200).sendFile(fullFilePath, (err) => {
  //       if (err) {
  //         console.log(err)
  //       }
  //     })
  //   }
  //   else {
  //     console.log('no proof found')
  //     res.status(400).send({'status': 'fail', 'message': 'an error occured finding file'})
  //   }
  // })
  res.send(200)
})

async function searchForProof(taskId) {
  //returns a full file path if file already exists
  let searchFiles = fs.readdirSync(uploadsPath)
  searchFiles.find(filename => {
    console.log("starting array search")
    if (filename.includes(taskId)) {
      return path.join(uploadsPath, filename)
    } else {
      console.log("proof not found")
      return null;
    }
  })
}