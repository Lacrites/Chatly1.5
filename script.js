// Variables
let peer;
let userId;
let userName;
let conn;
let messages = [];

// Referencias a los elementos HTML
const inicioDiv = document.getElementById("inicio");
const peerIdContainer = document.getElementById("peer-id-container");
const chatContainer = document.getElementById("chat-container");
const connectBtn = document.getElementById("connect-btn");
const sendMessageBtn = document.getElementById("send-message-btn");
const sendImageBtn = document.getElementById("send-image-btn");
const messageInput = document.getElementById("message-input");
const messageBox = document.getElementById("message-box");
const userIdDisplay = document.getElementById("user-id-display");
const userNameDisplay = document.getElementById("user-name-display");
const videoElement = document.getElementById("video");
const focusButton = document.getElementById("focus-button");
const shareLocationButton = document.getElementById("share-location");
const calculateDistanceButton = document.getElementById("calculate-distance");
const notification = document.getElementById("notification");

// Verifica si hay datos en localStorage
if (localStorage.getItem("userId") && localStorage.getItem("userName")) {
    userId = localStorage.getItem("userId");
    userName = localStorage.getItem("userName");

    // Mostrar el ID y nombre si están guardados
    userIdDisplay.innerText = `Tu ID: ${userId}`;
    userNameDisplay.innerText = `Tu Nombre: ${userName}`;

    // Mostrar la pantalla de conexión
    inicioDiv.style.display = "none";
    peerIdContainer.style.display = "block";
    chatContainer.style.display = "block";

    // Crear el peer
    peer = new Peer(userId);

    // Configuración de PeerJS
    peer.on("open", (id) => {
        console.log("Conectado con el ID: " + id);
    });

    peer.on("connection", (conn) => {
        console.log("Conexión establecida con: " + conn.peer);
        conn.on("data", (data) => {
            console.log("Mensaje recibido: ", data);
            displayMessage(data, conn.peer);
        });
    });
} else {
    // Si no hay ID guardado, muestra la pantalla de inicio
    inicioDiv.style.display = "block";
    peerIdContainer.style.display = "none";
    chatContainer.style.display = "none";
}

document.getElementById("start-chat").addEventListener("click", () => {
    userId = document.getElementById("user-id").value;
    userName = document.getElementById("user-name").value;

    // Validación
    if (userId && userName) {
        // Guardar en localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);

        // Ocultar la pantalla de inicio y mostrar la de conexión
        inicioDiv.style.display = "none";
        peerIdContainer.style.display = "block";
        chatContainer.style.display = "block";

        // Mostrar el ID y nombre del usuario
        userIdDisplay.innerText = `Tu ID: ${userId}`;
        userNameDisplay.innerText = `Tu Nombre: ${userName}`;

        // Crear el peer con el ID ingresado
        peer = new Peer(userId);

        // Evento cuando el peer se conecta
        peer.on("open", (id) => {
            console.log("Conectado con ID: " + id);
        });

        peer.on("connection", (conn) => {
            console.log("Conexión con: " + conn.peer);
            conn.on("data", (data) => {
                console.log("Mensaje recibido: ", data);
                displayMessage(data, conn.peer);
            });
        });

    } else {
        alert("Por favor, ingresa un ID y un nombre.");
    }
});

// Conectar con el otro usuario
connectBtn.addEventListener("click", () => {
    const otherUserId = document.getElementById("other-user-id").value;
    if (otherUserId) {
        // Crear la conexión
        conn = peer.connect(otherUserId);
        conn.on("open", () => {
            console.log("Conexión establecida con: " + otherUserId);
            conn.send(userName + " ha iniciado la conexión.");
        });
    } else {
        alert("Por favor ingresa el ID del otro usuario.");
    }
});

// Enviar mensaje de texto
sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value;
    if (conn && message) {
        conn.send(message);
        displayMessage(message, userId); // Muestra el mensaje en la pantalla
        messageInput.value = ''; // Limpiar el input
    } else {
        alert("Por favor ingresa un mensaje.");
    }
});

// Enviar imagen (como base64 o enlace)
sendImageBtn.addEventListener("click", () => {
    // Aquí deberías agregar la lógica para capturar o seleccionar una imagen
    const image = "data:image/jpeg;base64,..."; // Reemplazar con la imagen real
    if (conn && image) {
        conn.send(image);
        displayMessage("Imagen enviada", userId); // Mostrar que la imagen fue enviada
    } else {
        alert("No se ha seleccionado una imagen.");
    }
});

// Mostrar mensajes en el chat
function displayMessage(message, senderId) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (senderId === userId) {
        messageElement.classList.add("sent");
    } else {
        messageElement.classList.add("received");
    }

    messageElement.innerHTML = `
        <span class="sender">${senderId}</span>: ${message}
        <span class="time">${new Date().toLocaleString()}</span>
    `;
    messageBox.appendChild(messageElement);
    messageBox.scrollTop = messageBox.scrollHeight; // Desplazarse al último mensaje
}

// Habilitar la cámara (focus button)
focusButton.addEventListener("click", () => {
    if (videoElement.style.display === "none") {
        videoElement.style.display = "block"; // Mostrar cámara
        startCamera(); // Iniciar cámara
        focusButton.innerText = "Cerrar cámara";
    } else {
        videoElement.style.display = "none"; // Ocultar cámara
        focusButton.innerText = "Enfocar momento";
    }
});

// Obtener la ubicación del usuario
shareLocationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            console.log("Ubicación compartida: ", location);
            if (conn) {
                conn.send(location); // Enviar ubicación al otro usuario
            }
        });
    } else {
        alert("Geolocalización no soportada por tu navegador.");
    }
});

// Calcular distancia entre dos ubicaciones (si ambas están disponibles)
calculateDistanceButton.addEventListener("click", () => {
    if (locationData && otherLocationData) {
        const distance = calculateDistance(locationData, otherLocationData);
        alert(`La distancia entre ambos usuarios es: ${distance} km`);
    } else {
        alert("Ambos usuarios deben compartir su ubicación.");
    }
});

// Función para calcular distancia (en km) entre dos puntos geográficos
function calculateDistance(location1, location2) {
    const rad = Math.PI / 180;
    const R = 6371; // Radio de la Tierra en km
    const dLat = (location2.lat - location1.lat) * rad;
    const dLon = (location2.lon - location1.lon) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location1.lat * rad) * Math.cos(location2.lat * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Iniciar la cámara
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            videoElement.srcObject = stream;
        })
        .catch((error) => {
            console.error("Error al acceder a la cámara", error);
        });
}
