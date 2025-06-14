const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("resposne from the dashboard")
});

app.get("/about", (req, res) => {
    res.send("about page")
});

app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})