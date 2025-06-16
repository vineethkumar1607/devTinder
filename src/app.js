const express = require('express');
const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth.js")

app.use('/admin', adminAuth)

app.get("/admin/getAllData", (req, res, next) => {
    console.log("all the data response sent")
    res.send("all the users data")
})

app.post("/admin/deleteData", (req, res, next) => {
    console.log("delete data response sent")
    res.send("Data deleted successfully.......")
})

app.use("/users", userAuth, (req, res, next) => {
    res.send("user Data")
})

app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})