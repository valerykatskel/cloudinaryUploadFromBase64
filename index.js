// INDEX.JS
require('dotenv').config()
const bodyParser = require('body-parser')
const fs = require('fs')
const express = require('express')
const app = express()
const port = parseInt(process.env.PORT, 10) || 8080

app.use(bodyParser.urlencoded({extended: false}))

// MULTER
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.UPLOAD_FOLDER)
  },
  filename: function(req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
})

app.get('/', (req, res, next) => {
  res.send('There is no interesting here!')
})


app.post('/upload', (req, res, next) => {
  const imageBuffer = new Buffer.from(req.body.base64Str, 'base64');
  fs.writeFile(`${process.env.UPLOAD_FOLDER}sharingImage.png`, imageBuffer , function (err) {
    if (err) return next(err)

    // SEND FILE TO CLOUDINARY
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const path = `${process.env.UPLOAD_FOLDER}sharingImage.png`
    const uniqueFilename = new Date().toISOString()

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
})

app.listen(port)