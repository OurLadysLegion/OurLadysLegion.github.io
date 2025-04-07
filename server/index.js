const http = require("http");
const fs = require("fs");

const cwd = process.cwd();
const options = {
	//	key: fs.readFileSync("./certs/private-key.pem"),
	//	cert: fs.readFileSync("./certs/certificate.pem")
};

const server = http.createServer(options, (req, res) => {
	console.log(req.method, req.url);
	if (req.method === "GET") {
		let url = req.url;
		if (url === "/") {
			url = "/index.html";
		}
		if (fs.existsSync("./docs" + url)) {
			if (url.endsWith(".html")) {
				res.writeHead(200, { "Content-Type": "text/html" });
			} else if (url.endsWith(".css")) {
				res.writeHead(200, { "Content-Type": "text/css" });
			} else if (url.endsWith(".js")) {
				res.writeHead(200, { "Content-Type": "application/javascript" });
			} else if (url.endsWith(".svg")) {
				res.writeHead(200, { "Content-Type": "image/svg+xml" });
			} else {
				res.writeHead(200);
			}
			res.end(fs.readFileSync("./docs" + url));
		} else if (
			req.url.startsWith("/public/") &&
			fs.existsSync("./server/public" + req.url)
		) {
			if (req.url.endsWith(".html")) {
				res.writeHead(200, { "Content-Type": "text/html" });
			} else if (url.endsWith(".css")) {
				res.writeHead(200, { "Content-Type": "text/css" });
			} else if (url.endsWith(".js")) {
				res.writeHead(200, { "Content-Type": "application/javascript" });
			} else if (url.endsWith(".svg")) {
				res.writeHead(200, { "Content-Type": "image/svg+xml" });
			} else {
				res.writeHead(200);
			}
			res.end(fs.readFileSync("./server/public" + req.url));
		} else {
			res.writeHead(404);
			res.end("<h1>404 Error: Page Not Found!</h1>");
		}
	}
});

server.listen(80, () => {
	console.log("Server Listening Local Port 80");
});
