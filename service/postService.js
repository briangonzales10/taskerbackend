const fs = require('../scripts/firestoreHelper')
const helper = require('../scripts/helper')

exports.submitTask = async function submitTask(data) {
    let booleanIsPublic = helper.getBoolean(data.isPublic);

    let time = fs.Timestamp.now();

    let taskObject = {
            timestamp: time, //backend derived
            taskname: data.taskname, //front end
            location: {
            //frontend
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: data.location.address,
            },
            status: `OPEN`, //backend for new tasks of course
            picUrl:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80", //data.picUrl, //needs to be backend from pic URL service
            remarks: data.remarks, //frontend
            isPublic: booleanIsPublic, //frontend
            category: data.category,
            completedTime: '', // Blank until completed
            submittedBy: data.uid, //front end uuid of user & required update user Tasks
        };
    console.log(taskObject);
    try {
        let myTaskId;
        await fs.tasklist
        .add(taskObject)
        .then((results) => {
            console.log(results);
            myTaskId = results.id;
        })
        .catch((err) => {
            console.log(err);
        });

        fs.users
        .doc(data.uid)
        .update({
            submittedTasks: fs.FieldValue.arrayUnion(myTaskId)
        })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    } catch (err) {
        console.log(err)
    }
}

