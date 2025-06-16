const express = require('express');
const app = express();

// this a route and middleware function
app.get("/users", (req, res, next) => {
    console.log("handling the route handler 1");
    // res.send("respose 1 ")
    next()
})

// this is another route  and middleware function
app.get("/users", (req, res, next) => {
    console.log("handling the route handler 2");
    res.send("respose 2 ")
})

app.use("/", (req, res, next) => {
    res.send("from app.use / route")
    next()
})


app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})