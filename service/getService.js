const fs = require('../scripts/firestoreHelper')

//Collection Field names
const IS_COMPLETE = 'isComplete';
const IS_PUBLIC = 'isPublic';
const LOCATION = {address: 'address', latitude: 'latitude', longitude: 'longitude'}
const PICURL = 'picUrl';
const REMARKS = 'remarks';
const STATUS = 'status';
const SUBMITTED_BY = 'submittedBy';
const TASK_NAME_LABEL = 'taskname';
const TIMESTAMP_LABEL = 'timestamp';

exports.getTasks = async function getTasks(adminId) {
    console.log('getting getTasks()')
    if (adminId == process.env.ADMIN_UID) {  //only ADMIN allowed to view all public & private tasks
       return await getAllTasks();
    } else {
       return await getPublicTasks();
    }
}

//get public & private tasks
async function getAllTasks() {  
    try {
        let tasks = []
        const snapshot = await fs.tasklist.orderBy(TIMESTAMP_LABEL, 'desc').get();
        snapshot.forEach (doc => {
            // console.log(doc.id, '=>', doc.data())
            tasks.push({ taskid: doc.id, data: doc.data() });              
        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

async function getPublicTasks() {
    try {
        let tasks = []
        const snapshot = await fs.tasklist.orderBy(TIMESTAMP_LABEL, 'desc').get();
        snapshot.forEach (doc => {
            // console.log(doc.id, '=>', doc.data())
            if (doc.data().isPublic === true) {
                tasks.push({ taskid: doc.id, data: doc.data() }); 
             }
        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

exports.getUserTasks = async function getUserTasks(userId) {

    let tasks = []
    try {
        const snapshot = await fs.tasklist.where(SUBMITTED_BY, '==', userId).orderBy(TIMESTAMP_LABEL, 'desc').get();
        snapshot.forEach (doc => {
            console.log(doc.id, '=>', doc.data())
            tasks.push({ taskid: doc.id, data: doc.data() }); 

        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

exports.getSingleTask = async function getSingleTask(taskId) {
    let task;
    try {
      const singleTask = await fs.tasklist.doc(taskId).get();
  
      task = { taskid: singleTask.id, data: singleTask.data() };
  
    //   res.status(200).send(task);
    } catch (err) {
      console.log(err);

    }
    return task;
}