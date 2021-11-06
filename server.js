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
let scores = [];

const NB_PLAYERS_TO_PLAY = 2;
let indexOfDrawer = 0;

let words = ["apple", "house", "flower", "cat", "dog", "computer", "boat", "beer", "guitar", "tree", "fish"];
let prevWord;
let isPlaying = false;

app.ws('/socket', (socket, req) => {
    socket.on("message", (message) => {
        let json = JSON.parse(message);
        if (json.action == "connection") {
            console.log("connection of ", json.pseudo, ".");
            sockets.push({socket: socket, pseudo: json.pseudo});
            scores.push({pseudo: json.pseudo, score: 0});

            if ((sockets.length >= NB_PLAYERS_TO_PLAY) && !isPlaying) {
                isPlaying = true;

                setTimer();

                let indexOfWord = Math.floor(Math.random() * words.length);
                prevWord = words[indexOfWord];
                words.slice(indexOfWord, 1);

                for (let i = 0; i < sockets.length; i++) {
                    sockets[i].socket.send(JSON.stringify({action: "play", drawer: sockets[indexOfDrawer].pseudo, word: prevWord, scores: scores}));
                }
            } else if (sockets.length >= NB_PLAYERS_TO_PLAY) {
                socket.send(JSON.stringify({action: "play", drawer: json.pseudo, word: prevWord, scores: scores}));

                for(let i = 0; i < sockets.length; i++) {
                    sockets[i].socket.send(JSON.stringify({action: "newPlayer", scores: scores}));
                }
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

                let msg = "<i>server: " +json.pseudo +" find the word!</i>";

                for (let i = 0; i < sockets.length; i++) {
                    if (scores[i].pseudo == json.pseudo) {
                        scores[i].score += 1;
                    }
                    
                    sockets[i].socket.send(JSON.stringify({action: "find", word: prevWord, message: msg, pseudo: json.pseudo, drawer: sockets[indexOfDrawer].pseudo, scores: scores}));
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
            scores.slice(index, 1);
        }
    });

    socket.on("error", (error) => {
        console.error("Socket error: ", error);
    });
});

const TIME_PER_DRAW = 10 * 1000;

function setTimer() {
    setInterval(function () {
        let indexOfWord = Math.floor(Math.random() * words.length);
        prevWord = words[indexOfWord];
        words.slice(indexOfWord, 1);

        indexOfDrawer = (indexOfDrawer + 1) % sockets.length;

        let msg = "<p style=\"color: red;\"><i>server: timeout!</i></p>";

        for (let i = 0; i < sockets.length; i++) {
            sockets[i].socket.send(JSON.stringify({action: "timer", word: prevWord, message: msg, drawer: sockets[indexOfDrawer].pseudo}));
        }

    }, TIME_PER_DRAW);
}