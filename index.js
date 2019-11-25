// INDEX.JS
require('dotenv').config()
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
//const cors = require('cors')
const express = require('express')
const app = express()
const port = parseInt(process.env.PORT, 10) || 8080

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

//app.use(cors())
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
      res.status(200).end();
  } else {
      next();
  }
});

app.get('/', (req, res, next) => {
  res.send('There is no interesting here!')
})

app.post('/upload', (req, res, next) => {
  const timeStamp = +new Date
  if (!req.body.base64Str) return res.status(400).send("Image not provided!")
  const base64Image = req.body.base64Str
  const imageBuffer = new Buffer.from(base64Image, 'base64')
  
  ensureExists(process.env.UPLOAD_FOLDER, 0744, function(err) {
    if (err) res.status(400).send('Error during upload folder creating')
    
    fs.writeFile(`${process.env.UPLOAD_FOLDER}sharingImage${timeStamp}.png`, imageBuffer , function (err) {
      if (err) return next(err)

      // SEND FILE TO CLOUDINARY
      const path = `${process.env.UPLOAD_FOLDER}sharingImage${timeStamp}.png`
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

app.listen(port, () => {
  console.log(`Server run on port ${port}`)
})