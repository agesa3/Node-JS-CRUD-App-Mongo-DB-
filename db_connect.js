const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Learn",{useNewUrlParser:true},(error) => {
  if (!error) {
    console.log("Successfully Connected to the database");
  } else {
    console.log("Error connecting to the database");
  }
});

const Courses =require("./model/course_model")
