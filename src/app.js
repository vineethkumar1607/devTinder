const express = require('express');
const app = express();

// A Route can have many request handlers, like below first argumment is route and second and third aruguments are first and second route handlers respectively
app.get("/users", [(req, res, next) => {
    console.log("handling the route handler 1");

    next()
    res.send("respose 1 ")

}, (req, res, next) => {
    console.log("handling the route handler 2")
    // res.send(" response 2")\
    next()
}], (req, res, next) => {
    console.log("handling the route handler 3")
    // res.send(" response 3")
    next();
}, (req, res, next) => {
    console.log("handling the route handler 4")
    // res.send(" response 4")
    next()
}, (req, res, next) => {
    console.log("handling the route handler 5")
    // res.send(" response 5")
    next()
})

app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})