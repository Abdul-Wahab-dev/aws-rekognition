const express = require("express");
const { Rekognition } = require("@aws-sdk/client-rekognition");
const fs = require("fs");
const path = require("path");

const app = express();
const rekognition = new Rekognition({
  region: "us-east-1",
});

app.get("/", (req, res) => {
  rekognition.detectFaces(
    {
      Attributes: ["ALL"],
      Image: {
        Bytes: fs.readFileSync("./face.jpg"),
      },
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        fs.writeFileSync(
          path.resolve(__dirname, "./result.json"),
          JSON.stringify(data.FaceDetails)
        );
      }
    }
  );

  res.send("Hello");
});

app.get("/create-collection", async (req, res) => {
  const checkCollectionExist = await rekognition.describeCollection({
    CollectionId: "demo-collection",
  });
  if (checkCollectionExist.CollectionARN.includes("demo-collection")) {
    return res.status(200).json(checkCollectionExist);
  }

  const collection = await rekognition.createCollection({
    CollectionId: "demo-collection",
  });

  res.status(201).json(collection);
});

app.get("/add-img", async (req, res) => {
  const addImage = await rekognition.indexFaces({
    CollectionId: "demo-collection",
    Image: {
      Bytes: fs.readFileSync("./wick.jpeg"),
    },
  });

  res.status(200).json(addImage);
});

app.get("/compare-img", async (req, res) => {
  const compareStatus = await rekognition.searchFacesByImage({
    CollectionId: "demo-collection",
    Image: {
      Bytes: fs.readFileSync("./men.jpeg"),
    },
  });

  res.status(200).json(compareStatus);
});

app.listen(4000, () => {
  console.log("Server is running on PORT 4000");
});
