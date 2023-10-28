const express = require("express");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let userId = 0;
let courseId = 0;
let adminId = 0;

// Admin auth middleware
const adminAuthenticated = (req, res, next) => {
  const { username, password } = req?.headers;
  const admin = ADMINS.find(
    (admin) => admin.username === username && admin.password === password
  );
  if (admin?.id) {
    next();
  } else {
    res.status(403).send("Unauthorized");
    return;
  }
};

// user auth middleware
const userAuthenticated = (req, res, next) => {
  const { username, password } = req?.headers;
  const user = USERS.find(
    (user) => user.username === username && user.password === password
  );
  if (user?.id) {
    next();
  } else {
    res.status(403).send("Unauthorized");
    return;
  }
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req?.body;
  const admin = ADMINS.find((admin) => admin.username === username);
  if (admin?.id) {
    res.status(400).send("Admin username already present");
    return;
  }
  const id = ++adminId;
  const newAdmin = { id, username, password };
  ADMINS.push(newAdmin);
  res.status(201).send({ message: "Admin created successfully" });
});

app.post("/admin/login", adminAuthenticated, (req, res) => {
  // logic to log in admin
  res.send({ message: "Logged in successfully" });
});

app.post("/admin/courses", adminAuthenticated, (req, res) => {
  // logic to create a course
  const {
    title = "",
    description = "",
    price = 0,
    imageLink = "",
    published = false,
  } = req?.body;
  const id = ++courseId;
  const newCourse = { title, description, price, imageLink, published, id };
  COURSES.push(newCourse);
  res
    .status(200)
    .json({ message: "Course created successfully", courseId: id });
});

app.put("/admin/courses/:courseId", adminAuthenticated, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const {
    title = "",
    description = "",
    price = 0,
    imageLink = "",
    published = false,
  } = req?.body;
  const course = COURSES.find((course) => course?.id === courseId);
  if (!course?.id) {
    res.status(404).json({ message: "Course not found" });
  } else {
    if (title) course.title = title;
    if (description) course.description = description;
    if (price) course.price = price;
    if (imageLink) course.imageLink = imageLink;
    if (published !== undefined) course.published = published;
    res
      .status(200)
      .json({ message: "Course updated successfully", data: course });
  }
});

app.get("/admin/courses", adminAuthenticated, (req, res) => {
  // logic to get all courses
  res.status(200).json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const { username, password } = req?.body;
  const user = USERS.find((user) => user.username === username);
  if (user?.id) {
    res.status(400).send("User already present");
    return;
  }
  const id = ++userId;
  const purchasedCourses = [];
  const newUser = { id, username, password, purchasedCourses };
  USERS.push(newUser);
  res.status(201).send({ message: "Admin created successfully" });
});

app.post("/users/login", userAuthenticated, (req, res) => {
  // logic to log in user
  res.send({ message: "Logged in successfully" });
});

app.get("/users/courses", userAuthenticated, (req, res) => {
  // logic to list all courses
  const publishedCourses = COURSES.filter((course) => course?.published);
  res.status(200).json({ courses: publishedCourses });
});

app.post("/users/courses/:courseId", userAuthenticated, (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(
    (course) => course?.id === courseId && course?.published
  );
  const user = USERS.find((user) => user.username === req.headers.username);
  if (!course?.id) {
    res.status(404).json({ message: "Course not found" });
  } else {
    user.purchasedCourses.push(course);
    res.status(201).json({ message: "Course purchased successfully" });
  }
});

app.get("/users/purchasedCourses", userAuthenticated, (req, res) => {
  // logic to view purchased courses
  const user = USERS.find((user) => user.username === req.headers.username);
  res.status(200).json({ purchasedCourses: user.purchasedCourses });
});

app.get("/", (req, res) => {
  res.json({ users: USERS, courses: COURSES, admins: ADMINS });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
