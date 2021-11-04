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