// INDEX.JS
require('dotenv').config()
const bodyParser = require('body-parser')
const fs = require('fs')
const express = require('express')
const app = express()
const port = parseInt(process.env.SERVER_PORT, 10) || 8080

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


app.post('/upload', (req, res, next) => {
  //const upload = multer({ storage }).single('name-of-input-key')
  //console.log(req.body)
  const imageBuffer = new Buffer.from(req.body.base64Str, 'base64');
  fs.writeFile(`${process.env.UPLOAD_FOLDER}myfile.png`, imageBuffer , function (err) {
    if (err) return next(err)

    res.send('Successfully saved')
  })
  // upload(req, res, function(err) {
  //   if (err) {
  //     return res.send(err)
  //   }
  //   res.json(req.file)
  // })
})

app.listen(port)