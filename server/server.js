require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Config = require("./config");
const DAL = require("./dal");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");
const cloudinary = require("cloudinary");
const formData = require("express-form-data");
const bearerToken = require("express-bearer-token");
const { tokenDataHandler, noAuthHandlers } = require("./handlers");

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use(formData.parse());

cloudinary.config({
  cloud_name: "deeayeen",
  api_key: "952873244532749",
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.use(bearerToken());
app.use(tokenDataHandler);

const server = app.listen(process.env.PORT || PORT, async () => {
  await DAL.init(Config.mongoUrl, Config.dbName);
  console.log(`🔥 Listening on port ${process.env.PORT || PORT} 🔥`);
  const Controllers = require("./controllers"); //must be after DB initialization
  Controllers.forEach(({ controller, baseRoute }) => {
    app.use(`/${baseRoute}`, controller);
  });
});

app.get("/", async (req, res) => {
  res.send("tester");
});

app.post("/image-upload", (req, res) => {
  const values = Object.values(req.files);
  const promises = values.map((image) =>
    cloudinary.uploader.upload(image.path)
  );

  Promise.all(promises).then((results) => res.json(results));
});
