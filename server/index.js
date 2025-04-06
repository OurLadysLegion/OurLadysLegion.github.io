const http = require("https");
const fs = require("fs");

const server = http.createServer((req, res) => {
	if (req.method === "GET") {
		if (fs.existsSync("./files" + req.url)) {
			res.writeHead(200);
			res.end(fs.readFileSync("./files" + req.url));
		}
	}
});

server.listen(80, () => {
	console.log("Server Listening Local Port 80");
});