var binaryServer	= require('binaryjs').BinaryServer;
var wav				= require('wav');
//var opener			= require('opener');
var http			= require('http');
var fs				= require('fs');

//HTTP REQUEST & RESPONSE
var guestName		= null;
http.createServer(function (req, resp) {
	console.log("requested url::"+req.url);
	//console.log(req);
	if(req.url === "guestLogin"){
		resp.writeHead("SUCCESS");
		resp.end();
	}

	var body = "";
	req.on('data', function (chunk) {
		console.log("chunk::",chunk);
		body += chunk;
	});

	req.on('end', function () {
		console.log('POSTed: ' + body);
		guestName	= JSON.parse(body).name;
		age			= JSON.parse(body).age;
		gender		= JSON.parse(body).gender;
		console.log("guestName,age,gender::",guestName,age,gender);
		resp.writeHead(200);
		resp.end("success");
	});
}).listen(1337);

//RECORDING STARTS HERE
if(!fs.existsSync("recordings")){
    fs.mkdirSync("recordings");
}

var connect		= require('connect');
var serveStatic	= require('serve-static');
connect().use(serveStatic('public')).listen(9090);
//opener("http://localhost:9090");
var server = binaryServer({port: 9001});
server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;

    client.on('stream', function(stream, meta) {
		//console.log("client info",client);
		console.log("client url",client._socket.upgradeReq.url);
		var directoryName	= client._socket.upgradeReq.url;
		directoryName.substring(1, directoryName.length);
        console.log("Stream Start@" + meta.sampleRate +"Hz");
		console.log("guestName::",guestName);
		//var directoryName = guestName+"_"+age+"_"+gender;
		if(!fs.existsSync("recordings/"+directoryName+"/")){
			fs.mkdirSync("recordings/"+directoryName+"/");
		}		
        var fileName = "recordings/"+ directoryName + "/" + new Date().getTime()  + ".wav";
        fileWriter = new wav.FileWriter(fileName, {
            channels: 1,
            sampleRate: meta.sampleRate,
            bitDepth: 16
        });
        stream.pipe(fileWriter);
    });

    client.on('close', function() {
        if (fileWriter != null) {
            fileWriter.end();
        }
        console.log("Connection Closed");
    });
});