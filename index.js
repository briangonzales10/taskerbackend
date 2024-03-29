require("dotenv").config();

const express = require("express");
var cors = require("cors");
const fshelper = require("./scripts/firestoreHelper");
const multer = require('multer');


let helper = require("./scripts/helper.js");
let emailHelper = require("./scripts/emailHelper");
let googlePlace = require("./scripts/googlePlace.js");
let getService = require("./service/getService");
let postService = require("./service/postService")

const NO_TASKS = "No Tasks Available!";

const upload = multer({
  storage: multer.memoryStorage(),
  dest: 'uploads/proof'
}).single('file')
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

// app.use(upload)
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
    let tasks = await getService.getTasks(req.params.id, req.query.sort);
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
    let tasks = await getService.getUserTasks(req.params.id, req.query.sort);
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

  if (validatePost(data) == false) {
    res.status(400).send("data not valid");
    return;
  }
  try {
    await postService.submitTask(data)

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

  let updateData = {
    status: updateStatus
  }

  if (updateStatus == 'COMPLETE') {
    updateData.completedTime = fshelper.Timestamp.now();
    emailHelper.generateMail(taskIdToUpdate);
  }

  if (updateStatus !== "NONE") {
    await fshelper.tasklist
      .doc(taskIdToUpdate)
      .update(updateData);

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
app.post("/upload/:taskId", async function (req, res) {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      console.log(err)
    } else if (err) {
      console.log(err)
    }
      if (!req.file) {
    return res.status(400).send('No files were uploaded.');
    }
    const taskId = req.params.taskId;
    if (!taskId){
      return res.status(400).send('no task id provided!')
    }

    // Always update proof when posting a file!
    const results = await fshelper.uploadFile(taskId, req.file);
    
    console.log(`INDEX TASK: ${taskId} / Message: ${results.message}`);
    res.status(results.status).send(results.message);
  })
});

function validatePost(data) {
  if (
  !data || !data.uid || !data.taskname || !data.location ||
  !data.category ||
  data.isPublic == null ) {
    return false;
  }
  return true;
}