const fsHelper = require('../scripts/firestoreHelper')


exports.uploadFile = async function uploadFile(taskId, file) {
    const res = {
        'status': '',
        'message': ''
    }
    const blob = fsHelper.bucket.file(file)
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
            'proof': taskId
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
    })
    blobWriter.end(file.buffer)
    return res;
};