const mainDiv = document.getElementById("main");
const clientOptionsDiv = document.getElementById("CATClientOptions");
const serverOptionsDiv = document.getElementById("CATServerOptions");
const clientDiv = document.getElementById("CATClient");
const serverListReloadBtn = document.getElementById("CATServerListReload");
const CATServerList = document.getElementById("CATServerList");
const toggleOptionsBtn0 = document.getElementById("CATToggleOptionsBtn0");
const toggleOptionsBtn1 = document.getElementById("CATToggleOptionsBtn1");
const messageOutput = document.getElementById("CATMessageOutput");
const messageInput = document.getElementById("CATMessageInput");
const messageSubmit = document.getElementById("CATMessageSubmit");
const CATBackBtn = document.getElementById("CATBackBtn");


const clientBaseID = "cat-client-";
// full UUID for reference: '8ec76e28-009c-46eb-b4f2-9a251bd925e0'
const serverBaseID = "cat-server-8ec76e28-009c-";
var maxServerCount = 32;
var clientConfig = {
    name: "Anonymous",
    serverID: null,
    currentConn: null
};
var serverConfig = {
    name: "CAT Server",
    password: null
};


serverListReloadBtn.addEventListener("click", () => {
    getServerList().then((list) => {
        //console.log(list);
        CATServerList.innerHTML = "<h2>Server List: </h2>";
        list.forEach((server) => {
            var btn = document.createElement("input");
            btn.type = "button";
            btn.className = "CAT";
            btn.value = server.name + " (" + server.id.split("-").reverse()[0] + ")";
            btn.addEventListener("click", () => {
                clientConfig.serverID = server.id;
                runClient(clientConfig.serverID, showClient);
            });
            //console.log(btn);
            CATServerList.appendChild(document.createElement("br"));
            CATServerList.appendChild(btn);
            CATServerList.appendChild(document.createElement("br"));
        });
    });
});
serverListReloadBtn.click();

clientOptionsDiv.style.display = "block";
serverOptionsDiv.style.display = "none";
clientDiv.style.display = "none";
clientDiv.className = "CAT";

toggleOptionsBtn0.addEventListener("click", () => {
    if (clientOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "block";
        serverOptionsDiv.style.display = "none";
    } else if (serverOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "none";
        serverOptionsDiv.style.display = "block";
    }
    clientDiv.style.display = "none";
    clientDiv.className = "CAT";
});

toggleOptionsBtn1.addEventListener("click", () => {
    if (clientOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "block";
        serverOptionsDiv.style.display = "none";
    } else if (serverOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "none";
        serverOptionsDiv.style.display = "block";
    }
    clientDiv.style.display = "none";
    clientDiv.className = "CAT";
});

CATBackBtn.addEventListener("click", () => {
    clientConfig.serverID = null;
    clientConfig.currentConn.close();
    clientOptionsDiv.style.display = "block";
    serverOptionsDiv.style.display = "none";
    clientDiv.style.display = "none";
    clientDiv.className = "CAT";
});


function getServerList(max=maxServerCount) {
    var peer = new Peer(clientBaseID + crypto.randomUUID());
    var peerIDs = Array.from({length: max}, (_, i) => serverBaseID + i);
    const results = [];

    return new Promise((resolve) => {
        peer.on("open", () => {
            Promise.all(
                peerIDs.map(id => {
                    return new Promise(resolve => {
                        const conn = peer.connect(id);

                        conn.on("open", () => {
                            conn.on("data", (data) => {
                                console.log("Found active server:", id);
                                results.push(data);
                                conn.close();
                                resolve();
                            });
                            conn.send("GET SERVER DETAILS");
                        });

                        conn.on("error", (err) => {
                            //console.warn(err);
                            conn.close();
                            resolve();
                        });

                        setTimeout(() => {
                            if (conn.open) conn.close();
                            resolve();
                        }, 1000);
                    });
                })
            ).then(() => resolve(results));
        });
    });
}

function getAvailableIDs(serverList, max=maxServerCount) {
    var results = [];
    for (let i=0; i<max; i++) {
        results[i] = i;
    }
    serverList.forEach((server) => {
        let id = server.id.split("-").reverse()[0];
        results.splice(id, 1);
    });
    return results[0];
}

function showClient(peer, conn) {
    clientConfig.currentConn = conn;
    clientOptionsDiv.style.display = "none";
    serverOptionsDiv.style.display = "none";
    clientDiv.style.display = "flex";
    clientDiv.className = "CAT clientActive";
    conn.on("data", (data) => {
        messageOutput.innerText += data + "\n";
    });
    messageSubmit.addEventListener("click", () => {
        if (messageInput.value.trim() !== "") {
            conn.send(clientConfig.name + ": " + messageInput.value);
            messageInput.value = "";
        }
    });
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            messageSubmit.click();
        }
    });
}

function runClient(serverID, callback=() => {}) {
    var peer = new Peer(clientBaseID + crypto.randomUUID());
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        var conn = peer.connect(serverID);
        conn.on("open", () => {
            console.log("Connected to Server");
            callback(peer, conn);
            //window.setInterval(() => {conn.send("PING")}, 1000);
            //conn.on("data", (data) => {console.log(data)});
        });

        conn.on("close", () => {
            console.log("Disconnected from " + conn.peer);
        });
    });
    return peer;
}

async function runServer() {
    let serverList = await getServerList();
    let suffix = getAvailableIDs(serverList);
    var peer = new Peer(serverBaseID + suffix); // make this number dynamic
    var conns = [];
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        peer.on("connection", (conn) => {
            console.log("Connection from " + conn.peer);
            conns.push(conn);
            conn.on("data", (data) => {
                console.log(data);
                if (data === "GET SERVER DETAILS") {
                    var serverDetails = {
                        name: serverConfig.name,
                        id: id
                    };
                    conn.send(serverDetails);
                } else {
                    serverBroadcast(conns, data);
                }
            });

            conn.on("close", () => {
                console.log("Disconnected from " + conn.peer);
            });
        });
    });
    return peer;
}

function serverBroadcast(conns, data) {
    conns.forEach((conn) => {
        try {
            conn.send(data);
        } catch (err) {
            //console.warn(err);
        }
    });
}
