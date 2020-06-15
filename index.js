require("dotenv").config();
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fs = require("fs");
const express = require("express");
const app = express();
const port = parseInt(process.env.PORT, 10) || 8088;

// cloudinary.config({
//   cloud_name: `CLOUDINARY_CLOUD_NAME_${process.env.CLOUDINARY_CLOUD_ID}`,
//   api_key: `CLOUDINARY_API_KEY_${process.env.CLOUDINARY_CLOUD_ID}`,
//   api_secret: `CLOUDINARY_API_SECRET_${process.env.CLOUDINARY_CLOUD_ID}`,
//   upload_folder: `CLOUDINARY_UPLOAD_FOLDER_${process.env.CLOUDINARY_CLOUD_ID}`,
// });

app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// app.all("/*", function (req, res, next) {
//   // CORS headers
//   res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   // Set custom headers for CORS
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-type,Accept,X-Access-Token,X-Key"
//   );
//   if (req.method == "OPTIONS") {
//     res.status(200).end();
//   } else {
//     next();
//   }
// });

app.get("/", (req, res, next) => {
  res.send("There is no interesting here!");
});

app.post("/upload", (req, res, next) => {
  const timeStamp = +new Date();
  let uniqueFilename = "";
  if (!req.body.base64Str) return res.status(400).send("Image not provided!");

  //console.log(`file created ${path} uniqueFilename=${uniqueFilename}`)
  const cloudId = process.env.CLOUDINARY_CLOUD_ID;
  const cloudinaryCloudName = `CLOUDINARY_CLOUD_NAME_${cloudId}`;
  const cloudinaryApiKey = `CLOUDINARY_API_KEY_${cloudId}`;
  const cloudinaryApiSecret = `CLOUDINARY_API_SECRET_${cloudId}`;
  let cloudinaryUploadFolder = "";
  console.log(req.body.upldf);
  if (req.body.upldf) cloudinaryUploadFolder = req.body.upldf;
  else
    cloudinaryUploadFolder = process.env[`CLOUDINARY_UPLOAD_FOLDER_${cloudId}`];

  const base64Image = req.body.base64Str;
  const imageBuffer = new Buffer.from(base64Image, "base64");
  ensureExists(cloudinaryUploadFolder, 0744, function (err) {
    if (err) res.status(400).send("Error during upload folder creating");

    fs.writeFile(
      `${cloudinaryUploadFolder}sharingImage${timeStamp}.jpg`,
      imageBuffer,
      function (err) {
        if (err) return next(err);
        // SEND FILE TO CLOUDINARY
        const path = `${cloudinaryUploadFolder}sharingImage${timeStamp}.jpg`;

        if (
          req.body.de !== undefined &&
          req.body.sp !== undefined &&
          req.body.vr !== undefined &&
          req.body.sm !== undefined
        ) {
          uniqueFilename = `${req.body.de}-${req.body.sp}-${req.body.vr}-${req.body.sm}`;
        } else {
          uniqueFilename = timeStamp;
        }

        cloudinary.uploader.upload(
          path,
          {
            public_id: `${cloudinaryUploadFolder}/${uniqueFilename}`,
            tags: "quiz",
            format: "jpg",
            cloud_name: `${process.env[cloudinaryCloudName]}`,
            api_key: `${process.env[cloudinaryApiKey]}`,
            api_secret: `${process.env[cloudinaryApiSecret]}`,
            upload_folder: `${cloudinaryUploadFolder}`,
          }, // directory and tags are optional
          function (err, image) {
            if (err) return res.send(err);
            console.log(
              `file ${cloudinaryUploadFolder}/${uniqueFilename} has been uploaded to Cloudinary`
            );
            // remove file from server
            const fs = require("fs");
            fs.unlinkSync(path);
            // return image details
            res.json(image);
          }
        );
      }
    );
  });
});

function ensureExists(path, mask, cb) {
  if (typeof mask == "function") {
    // allow the `mask` parameter to be optional
    cb = mask;
    mask = 0777;
  }
  fs.mkdir(path, mask, function (err) {
    if (err) {
      if (err.code == "EEXIST") cb(null);
      // ignore the error if the folder already exists
      else cb(err); // something else went wrong
    } else cb(null); // successfully created folder
  });
}

app.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
