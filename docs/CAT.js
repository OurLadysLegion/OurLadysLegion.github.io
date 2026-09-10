// Declare element variables
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
const CATServerLogs = document.getElementById("CATServerLogs");

// Declare configuration variables
const clientBaseID = "cat-client-";
// full UUID for reference: '8ec76e28-009c-46eb-b4f2-9a251bd925e0'
const serverBaseID = "cat-server-8ec76e28-009c-";
const registryID = "cat-registry-8ec76e28-009c-46eb-b4f2-9a251bd925e0";
let maxServerCount = 32;
let clientConfig = {
    name: "Anonymous",
    password: "",
    serverID: null,
    currentConn: null
};
let serverConfig = {
    name: "CAT Server",
    password: ""
};

// Set button event listeners
serverListReloadBtn.addEventListener("click", () => {
    // getServerList()
    queryRegistry().then(async (list) => {
        if (list === false) {
            list = await getServerList();
        }
        //console.log(list);
        CATServerList.innerHTML = "<h2>Server List: </h2>";
        list.forEach((server) => {
            let btn = document.createElement("input");
            btn.type = "button";
            btn.className = "CAT";
            btn.value = server.name + " (" + server.id.split("-").reverse()[0] + ")";
            btn.addEventListener("click", () => {
                clientConfig.serverID = server.id;
                runClient(clientConfig.serverID)//, showClient);
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

const toggleOptionsFunc = () => {
    if (clientOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "block";
        serverOptionsDiv.style.display = "none";
    } else if (serverOptionsDiv.style.display === "none") {
        clientOptionsDiv.style.display = "none";
        serverOptionsDiv.style.display = "block";
    }
    clientDiv.style.display = "none";
    clientDiv.className = "CAT";
}

toggleOptionsBtn0.addEventListener("click", toggleOptionsFunc);
toggleOptionsBtn1.addEventListener("click", toggleOptionsFunc);

CATBackBtn.addEventListener("click", () => {
    clientConfig.serverID = null;
    clientConfig.currentConn.close();
    clientOptionsDiv.style.display = "block";
    serverOptionsDiv.style.display = "none";
    clientDiv.style.display = "none";
    clientDiv.className = "CAT";
});


// Declare main functions

function queryRegistry() {
    let start = performance.now();
    let peer = new Peer(clientBaseID + crypto.randomUUID());
    window.addEventListener("beforeunload", () => peer.destroy());
    return new Promise((resolve) => {
        peer.on("open", () => {
            const conn = peer.connect(registryID);
            conn.on("data", (data) => {
                // console.log(data);
                peer.destroy();
                let end = performance.now();
                // console.log(`Registry took: ${end - start} ms`);
                resolve(data);
            });
            conn.on("open", () => {
                console.log("Connected to Registry");
                conn.send({msg: "GET SERVER LIST"});
            });
            conn.on("error", (err) => {
                peer.destroy();
                resolve(false);
            });
            setTimeout(() => {
                peer.destroy();
                resolve(false);
            }, 2000);
        });
        peer.on("error", (err) => {
            console.warn(err);
            if (err.type === "peer-unavailable") {
                resolve(false);
            }
        });
    });
}

function getServerList(max=maxServerCount) {
    let start = performance.now();
    let peer = new Peer(clientBaseID + crypto.randomUUID());
    window.addEventListener("beforeunload", () => peer.destroy());
    let peerIDs = Array.from({length: max}, (_, i) => serverBaseID + i);
    const results = [];

    return new Promise((resolve) => {
        peer.on("open", () => {
            Promise.all(
                peerIDs.map(id => {
                    return new Promise(resolve => {
                        const conn = peer.connect(id);

                        conn.on("data", (data) => {
                            console.log("Found active server:", id);
                            let i = parseInt(data.id.split("-").pop());
                            results[i] = data;
                            conn.close();
                            resolve();
                        });

                        conn.on("open", () => {
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
            ).then(() =>  {
                let end = performance.now();
                //console.log(`v1: ${end - start} ms`);
                console.log("Server list", results);
                resolve(results);
            });
        });
    });
}

function getServerListBatching(max = maxServerCount) { // slower, probably shouldn't use
    let start = performance.now();
    let peer = new Peer(clientBaseID + crypto.randomUUID());
    window.addEventListener("beforeunload", () => peer.destroy());
    let peerIDs = Array.from({ length: max }, (_, i) => serverBaseID + i);
    const results = [];
    const BATCH = 8;

    return new Promise((resolve) => {
        peer.on("open", () => {
            let start = 0;

            function nextBatch() {
                const batch = peerIDs.slice(start, start + BATCH);
                start += BATCH;

                Promise.all(
                    batch.map(id => {
                        return new Promise(resolve => {
                            const conn = peer.connect(id);

                            conn.on("data", (data) => {
                                console.log("Found active server:", id);
                                let i = parseInt(data.id.split("-").pop());
                                results[i] = data;
                                conn.close();
                                resolve();
                            });

                            conn.on("open", () => {
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
                ).then(() => {
                    if (start < peerIDs.length) {
                        nextBatch();
                    } else {
                        peer.destroy();
                        let end = performance.now();
                        //console.log(`v2: ${end - start} ms`);
                        resolve(results);
                    }
                });
            }

            nextBatch();
        });
    });
}

function getAvailableIDs(serverList, max=maxServerCount) {
    let results = {};
    for (let i=0; i<max; i++) {
        results[i] = true;
    }
    serverList.forEach((server) => {
        let id = parseInt(server.id.split("-").pop());
        results[id] = false;
    });
    console.log(results);
    return Object.keys(results)
        .filter(k => results[k]) // only allow true (i.e. unused) ids
        .map(parseInt);
}

function runClient(serverID) {
    let peer = new Peer(clientBaseID + crypto.randomUUID());
    window.addEventListener("beforeunload", () => peer.destroy());
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        let conn = peer.connect(serverID);
        clientConfig.currentConn = conn;
        conn.on("open", () => {
            conn.send("USER LOGIN " + clientConfig.name);
            console.log("Connected to Server");
            messageOutput.innerText += "[[ Connected to Server ]]\n";
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
        });

        conn.on("close", () => {
            console.log("Disconnected from " + conn.peer);
            messageOutput.innerText += "[[ Disconnected from Server ]]\n";
            messageOutput.innerText = "";
        });
    });
    return peer;
}

async function runRegistry() {
    //let servers = [];
    let servers = await getServerList(); // this must run BEFORE Peer is created, otherwise there is a race condition.
    /*if (registry !== []) {
        servers = registry;
    }*/
    let peer = new Peer(registryID);
    window.addEventListener("beforeunload", () => peer.destroy());
    console.log("registry server list: ", servers);
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        peer.on("connection", (conn) => {
            let id = parseInt(conn.peer.split("-").pop());
            conn.on("data", async (data) => {
                if (data.msg === "JOIN") {
                    servers[id] = data.details;
                } else if (data.msg === "LEAVE") {
                    delete servers[id];
                } else if (data.msg === "GET SERVER LIST") {
                    conn.send(Object.values(servers));
                    servers = await getServerList();
                }
            });
            conn.on("close", () => {
                delete servers[id];
            });
        });
    });
    peer.on("error", (err) => {
        console.warn(err);
    });
}

async function runServer() {
    let registry = await queryRegistry();
    if (registry === false) {
        runRegistry();
        registry = await getServerList();
    }
    let serverList = registry;
    // let serverList = await getServerList();
    let suffix = getAvailableIDs(serverList)[0];
    let peer = new Peer(serverBaseID + suffix);
    window.addEventListener("beforeunload", () => peer.destroy());
    let conns = [];
    peer.on("open", (id) => {
        console.log("Peer ID is " + id);
        CATServerLogs.innerText += "[[ Server is Running ]]\n";
        let regConn = peer.connect(registryID);
        regConn.on("open", () => {
            setInterval(() => {
                let serverDetails = {
                    name: serverConfig.name,
                    id: id
                };
                regConn.send({msg: "JOIN", details: serverDetails});
            }, 5000);
        });
        peer.on("connection", (conn) => {
            console.log("Connection from " + conn.peer);
            CATServerLogs.innerText += "[[ Connection from " + conn.peer + " ]]\n";
            //serverBroadcast(conns, "[[ User <" + conn.peer + "> has connected ]]\n");
            conns.push(conn);
            conn.on("data", (data) => {
                console.log(data);
                if (data === "GET SERVER DETAILS") {
                    let serverDetails = {
                        name: serverConfig.name,
                        id: id
                    };
                    conn.send(serverDetails);
                } else if (data.startsWith("USER LOGIN ")) {
                    let username = data.split("USER LOGIN ")[1];
                    let connsExcludingUser = conns.filter(c => c !== conn);
                    serverBroadcast(connsExcludingUser, "[[ User <" + username+ "> has connected ]]");
                } else {
                    serverBroadcast(conns, data);
                }
            });

            conn.on("close", () => {
                console.log("Disconnected from " + conn.peer);
                CATServerLogs.innerText += "[[ Disconnected from " + conn.peer + " ]]\n";
                conns = conns.filter(c => c !== conn);
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
