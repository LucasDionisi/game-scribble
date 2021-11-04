let socket;

function connectWebSocket(pseudo) {
    const url = `ws://${window.location.host}/socket`;
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("Socket connected.");
        // socket.send(pseudo);
    }

    socket.onmessage = (message) => {
        console.log(message);
    }

    socket.onclose = () => {
        console.log("Socket close.");
    }

    socket.onerror = (error) => {
        console.error("Socket error.", error);
    }

    return socket;
}

document.getElementById('button_pseudo').onclick = function () {
    const inputPseudo = document.getElementById('input_pseudo');
    let pseudo = inputPseudo.value;
    inputPseudo.value = "";

    socket = connectWebSocket(pseudo);
}