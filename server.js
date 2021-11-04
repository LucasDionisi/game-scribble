const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const { SocketAdress } = require('net');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    console.log("got request.");
});

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3000');
});