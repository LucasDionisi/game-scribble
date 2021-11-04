const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const { SocketAdress } = require('net');

const app = express();
const port = 3000;

expressWs(app);

app.use(express.static('client'));

app.get('/', (req, res) => {
    const filePath = path.resolve("client/client.html")
    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3000');
});

let sockets = [];

app.ws('/socket', (socket, req) => {
    socket.on("message", (message) => {
        let json = JSON.parse(message);

        if (json.action == "connection") {
            console.log("connection of ", json.pseudo, ".");
            sockets.push({socket: socket, pseudo: json.pseudo});
        }
    });

    socket.on("close", (code) => {
        const index = sockets.indexOf(socket);
        if (index > -1) {
            sockets.slice(index, 1);
        }
    });

    socket.on("error", (error) => {
        console.error("Socket error: ", error);
    });
});