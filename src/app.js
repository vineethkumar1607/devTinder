const express = require('express');
const app = express();

// this doesnot work as it doesnot folows the order of execution
// app.use("/", (err, req, res, next) => {
//     if (err) {
//         console.log("error in sending the response:", err)
//         res.status(500).send("Something went wrogn")
//     }
// })

app.use('/users', (req, res, next) => {
    // showing the error message by using the try catch method
    try {
        throw new Error("error")
        res.send("user Data....")

     } catch (error) {
        // console.log(error, "Error sending the response")
        console.log("message sent error")
        res.status(500).send("somenthiung went wrogn from try catch")
    }
})


// showing the errro using error object. this will only work if the try catch is not present
app.use("/", (err, req, res, next) => {
    if (err) {
        console.log("error in sending the response:", err)
        res.status(500).send("Something went wrogn")
    }
})

app.listen(7777, () => {
    console.log("server is listening to the port 7777")
})