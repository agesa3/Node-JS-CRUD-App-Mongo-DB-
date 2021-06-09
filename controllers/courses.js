const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const CourseModel = mongoose.model("Course");

router.get("/list", (req, res) => {
//   var course = new CourseModel();
//   course.courseName = "Node Js";
//   course.courseId = "2";
//   course.save();
 
  CourseModel.find({})
    .lean()
    .exec(function (err, docs) {
      if (!err) {
        console.log(docs);
        res.render("list", { data: docs });
      }
    });
});

module.exports = router;
