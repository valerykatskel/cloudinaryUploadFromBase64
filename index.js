// INDEX.JS
require('dotenv').config()
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const cors = require('cors')
const express = require('express')
const app = express()
const port = parseInt(process.env.PORT, 10) || 8080

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res, next) => {
  res.send('There is no interesting here!')
})


app.post('/upload', (req, res, next) => {
  const imageBuffer = new Buffer.from(req.body.base64Str, 'base64')
  
  ensureExists(__dirname + process.env.UPLOAD_FOLDER, 0744, function(err) {
    if (err) {
      res.status(400)
      res.send('Error during upload folder creating')
    } else {
      fs.writeFile(`${process.env.UPLOAD_FOLDER}/sharingImage.png`, imageBuffer , function (err) {
        if (err) return next(err)

        // SEND FILE TO CLOUDINARY
        const path = `${__dirname}${process.env.UPLOAD_FOLDER}/sharingImage.png`
        const uniqueFilename = `${req.body.de}-${req.body.sp}-${req.body.vr}-${req.body.sm}`

        cloudinary.uploader.upload(
          path,
          { 
            public_id: `${process.env.CLOUDINARY_UPLOAD_FOLDER}/${uniqueFilename}`, 
            tags: `quiz`
          }, // directory and tags are optional
          function(err, image) {
            if (err) return res.send(err)
            console.log('file uploaded to Cloudinary')
            // remove file from server
            const fs = require('fs')
            fs.unlinkSync(path)
            // return image details
            res.json(image)
          }
        )
      })
    }
  })
})

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

app.listen(port)