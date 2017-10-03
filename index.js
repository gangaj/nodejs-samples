//Blocking process
var fs		= require("fs");
var data	= fs.readFileSync('read.txt');
console.log(data.toString());
console.log("Program Ended 1111");


//Non-Blocking process
var fs		= require("fs");
fs.readFile('read.txt', function (err, data) {
    if (err) return console.error(err);
    console.log(data.toString());
});
console.log("Program Ended 2222");