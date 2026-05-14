const serverBaseID = "23e10590-8809-446d-83ff-d16688c3bac5"; //hardcoded baseID for now, may make this dynamic later.



function runClient() {
    var peer = new Peer(serverBaseID);
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        peer.on("connection", (conn) => {
            console.log("Connection from " + conn.peer);
            conn.on("data", (data) => {
                console.log(data);
                conn.send("PONG");
            });

            conn.on("close", () => {
                console.log("Disconnected from " + conn.peer);
            });
        });
    });
    return peer;
}

function runServer() {
    var peer = new Peer();
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        var conn = peer.connect(serverBaseID);
        conn.on("open", () => {
            console.log("Connected to Server");
            window.setInterval(() => {conn.send("PING")}, 1000);
            conn.on("data", (data) => {console.log(data)});
        });

        conn.on("close", () => {
            console.log("Disconnected from " + conn.peer);
        });
    });
    return peer;
}
