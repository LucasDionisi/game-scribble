let socket;
let myPseudo;

function connectWebSocket(pseudo) {
    const url = `ws://${window.location.host}/socket`;
    socket = new WebSocket(url);
    myPseudo = pseudo;

    socket.onopen = () => {
        console.log("Socket connected.");
        
        let json = {action: "connection", pseudo: myPseudo};
        socket.send(JSON.stringify(json));
    }

    socket.onmessage = (message) => {
        let json = JSON.parse(message.data);

        if (json.action == "draw") {
            drawLine(json);
        }

        if (json.action == "play") {
            isPLaying = true;
            document.getElementById('div_cog').style.display = "none";
            document.getElementById('div_game').style.display = "flex";
            if (json.drawer == myPseudo) {
                isMyTurn = true;
            }
        }
    }

    socket.onclose = () => {
        console.log("Socket close.");
    }

    socket.onerror = (error) => {
        console.error("Socket error.", error);
    }

    return socket;
}

//===========================================================================
//===========================================================================

document.getElementById('button_pseudo').onclick = function () {
    const inputPseudo = document.getElementById('input_pseudo');
    let pseudo = inputPseudo.value;
    
    if (pseudo != "") {
        inputPseudo.value = "";

        socket = connectWebSocket(pseudo);
        document.getElementById('div_pseudo').style.display = "none";
        document.getElementById('div_cog').style.display =  "flex";
    }
}

//===========================================================================
//===========================================================================

const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");

let isPLaying = false;
let isDrawing = false;
let isMyTurn = false;

let x = 0, y = 0;

ctx.fillStyle = "#FFFFFF";

ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousedown', e => {
    x = e.clientX - canvas.getBoundingClientRect().x;
    y = e.clientY - canvas.getBoundingClientRect().y;

    isDrawing = true;
});

canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        sendDrawLine(x, y, e.clientX - canvas.getBoundingClientRect().x, e.clientY - canvas.getBoundingClientRect().y);
        x = e.clientX - canvas.getBoundingClientRect().x;
        y = e.clientY - canvas.getBoundingClientRect().y;
    }
});

window.addEventListener('mouseup', e => {
    if (isDrawing) {
        sendDrawLine(x, y, e.clientX - canvas.getBoundingClientRect().x, e.clientY - canvas.getBoundingClientRect().y);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

function sendDrawLine(x1, y1, x2, y2) {
    if (isPLaying && isMyTurn) {
        let action = "draw";
        let json = {action: action, color: "black", x1: x1, y1: y1, x2: x2, y2: y2};
        socket.send(JSON.stringify(json));
    }
}

function drawLine(json) {
    if (isPLaying) {
        ctx.beginPath();
        ctx.strokeStyle = json.color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.moveTo(json.x1, json.y1);
        ctx.lineTo(json.x2, json.y2);
        ctx.stroke();
        ctx.closePath();
    }
}


//===========================================================================
//===========================================================================