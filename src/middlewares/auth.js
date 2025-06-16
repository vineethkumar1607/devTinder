
const adminAuth = (req, res, next) => {
    const token = "abcd";
    const adminAuthentication = token === "abcd";
    if (!adminAuthentication) {
        return res.status(401).send("Unauthorised request")
    } else {
        console.log("admin authenticated successfully...");
        next()
    }
}

const userAuth = (req, res, next) => {
    const token = "xyz";
    const userAuthentication = token === "xyz";
    if (!userAuthentication) {
      return  res.status(401).send("unauthorised request")
    } else {
        console.log("user authenticated successfully...");
        next();
    }
}

module.exports = {adminAuth, userAuth}