const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const CourseModel = mongoose.model("Course");

router.get("/add", (req, res) => {
  res.render("add_course");
});

router.post("/add", (req, res) => {
  var course = new CourseModel();
  course.courseName = req.body.courseName;
  course.courseDuration = req.body.courseDuration;
  course.courseFees = req.body.courseFees;
  course.courseId = Math.ceil(Math.random() * 1000000)+"";
  course.save((err, doc) => {
    if (!err) {
      res.redirect("/courses/list");
    } else {
      res.send("Error occured");
    }
  });
});

router.get("/list", (req, res) => {
  CourseModel.find({})
    .lean()
    .exec(function (err, docs) {
      if (!err) {
        res.render("list", { data: docs });
      }
    });
});

module.exports = router;
