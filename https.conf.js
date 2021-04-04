var fs = require("fs");
 
module.exports = {
    cert: fs.readFileSync(__dirname + "/cert.pem"),
    key: fs.readFileSync(__dirname + "/key.pem")
};
