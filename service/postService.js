const fsHelper = require('../scripts/firestoreHelper')


exports.uploadFile = async function uploadFile(taskId, file) {
    console.log("starting upload")
    const res = {
        'status': 200,
        'message': ''
    }
    const blob = fsHelper.bucket.file(file.originalname)
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
    blobWriter.on('finish', () => {
        res.status = 200
        res.message = `File uploaded for task Id: ${taskId}` 
        console.log(res.message)
    })
    blobWriter.end(file.buffer)
    return res;
};
