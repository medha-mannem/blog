import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = 3000; 

// Set up body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// In-memory storage for blogs
let blogs = [];

// Route handlers
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/newpost", (req, res) => {
  res.render("newpost");
});

app.get("/content", (req, res) => {
  res.render("content", { blogs: blogs });
});

app.get("/blogs/:id", (req, res) => {
  const blog = blogs.find((b) => b.id === req.params.id);
  if (blog) {
    res.render("blog", { blog: blog });
  } else {
    res.status(404).send("Blog not found");
  }
});

app.get("/blogs/:id/update", (req, res) => {
  const blog = blogs.find((b) => b.id === req.params.id);
  if (blog) {
    res.render("update", { blog: blog });
  } else {
    res.status(404).send("Blog not found");
  }
});

app.post(
  "/blogs/:id/update",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  (req, res) => {
    const blogIndex = blogs.findIndex((b) => b.id === req.params.id);
    if (blogIndex !== -1) {
      blogs[blogIndex] = {
        ...blogs[blogIndex],
        title: req.body.title || blogs[blogIndex].title,
        introduction: req.body.introduction || blogs[blogIndex].introduction,
        description: req.body.description || blogs[blogIndex].description,
        image1: req.files.image1
          ? "/uploads/" + req.files.image1[0].filename
          : blogs[blogIndex].image1,
        image2: req.files.image2
          ? "/uploads/" + req.files.image2[0].filename
          : blogs[blogIndex].image2,
        image3: req.files.image3
          ? "/uploads/" + req.files.image3[0].filename
          : blogs[blogIndex].image3,
        thumbnail: req.files.thumbnail
          ? "/uploads/" + req.files.thumbnail[0].filename
          : blogs[blogIndex].thumbnail,
      };
      res.redirect("/blogs/" + req.params.id);
    } else {
      res.status(404).send("Blog not found");
    }
  }
);

app.post("/blogs/:id/delete", (req, res) => {
  blogs = blogs.filter((b) => b.id !== req.params.id);
  res.redirect("/content");
});

app.post(
  "/content",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  (req, res) => {
    const newBlog = {
      id: uuidv4(),
      title: req.body.title,
      introduction: req.body.introduction,
      description: req.body.description,
      image1: req.files.image1
        ? "/uploads/" + req.files.image1[0].filename
        : null,
      image2: req.files.image2
        ? "/uploads/" + req.files.image2[0].filename
        : null,
      image3: req.files.image3
        ? "/uploads/" + req.files.image3[0].filename
        : null,
      thumbnail: req.files.thumbnail
        ? "/uploads/" + req.files.thumbnail[0].filename
        : null,
    };
    blogs.push(newBlog);
    res.redirect("/content");
  }
);

app.listen(process.env.PORT||port, function () {
  console.log(`listening on port ${port}`);
});
