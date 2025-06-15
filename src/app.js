const express = require("express");
const app = express();


app.get("/search", (req, res) => {

    const term = req.query.q;
    const page = req.query.page || 1;
    res.send(`search term = ${term} and page = ${page}`)
})

app.get("/users", (req, res) => {

    const name = req.query.name;
    const age = req.query.age
    res.send(`name= ${name} and age=  ${age}`)
})
app.get("/users/:userId/:name/:password", (req, res) => {
    res.send(req.params)

})

// app.use("/user", (req, res)=>{
//     res.send("this is using 'use' method")
// })
// app.get(/\/ab+cd/, (req, res) => {
// app.get("/ab*cd", (req, res) => {
app.get(/\/ab?cd/, (req, res) => {
    // app.get(/\/a(bc)+d/, (req, res) => {

    res.send("abcd")
})

app.post("/user", (req, res) => {
    res.send("user data saved to the database")
})

app.delete("/user", (req, res) => {
    res.send("user deleted successfully")
});

app.get("/user", (req, res) => {
    res.send({ name: "vineeth", mail: "vineeth@gmail.com" })
})

app.put("/user", (req, res) => {
    res.send("data modified successfully")
})

app.patch("/user", (req, res) => {
    res.send("data modified partially...")
})
app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})