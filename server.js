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
const NB_PLAYERS_TO_PLAY = 2;
let indexOfDrawer = 0;

let words = ["apple", "house", "flower", "cat", "dog", "computer", "boat", "beer", "guitar", "tree", "fish"];
let prevWord;
let isPlaying = false;

app.ws('/socket', (socket, req) => {
    socket.on("message", (message) => {
        let json = JSON.parse(message);

        // console.log(message);

        if (json.action == "connection") {
            console.log("connection of ", json.pseudo, ".");
            sockets.push({socket: socket, pseudo: json.pseudo});

            if ((sockets.length >= NB_PLAYERS_TO_PLAY) && !isPlaying) {
                isPlaying = true; 
                let indexOfWord = Math.floor(Math.random() * words.length);
                prevWord = words[indexOfWord];
                words.slice(indexOfWord, 1);

                for (let i = 0; i < sockets.length; i++) {
                    sockets[i].socket.send(JSON.stringify({action: "play", drawer: sockets[indexOfDrawer].pseudo, word: prevWord}));
                }
            } else if (sockets.length >= NB_PLAYERS_TO_PLAY) {
                socket.send(JSON.stringify({action: "play", drawer: json.pseudo, word: prevWord}));
            }
        }

        if (json.action == "draw") {
            for (let i = 0; i < sockets.length; i++) {
                sockets[i].socket.send(message);
            }
        }

        if (json.action == "chat") {
            let msgRcv = json.word;

            if ((sockets[indexOfDrawer].pseudo != json.pseudo) && (msgRcv.toLowerCase() == prevWord.toLowerCase())) {
                let indexOfWord = Math.floor(Math.random() * words.length);
                prevWord = words[indexOfWord];
                words.slice(indexOfWord, 1);

                indexOfDrawer = (indexOfDrawer + 1) % sockets.length;

                for (let i = 0; i < sockets.length; i++) {
                    sockets[i].socket.send(JSON.stringify({action: "find", word: prevWord, message: json.message, pseudo: json.pseudo, drawer: sockets[indexOfDrawer].pseudo}));
                }
            } else {
                for (let i = 0; i < sockets.length; i++) {
                    sockets[i].socket.send(message);
                }
            }
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