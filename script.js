const peer = new Peer();
let userId, userName, otherUserId;
let localStream;
let remoteStream;
let cameraOpen = false;

// Obtener los elementos del DOM
const inicioDiv = document.getElementById("inicio");
const chatContainer = document.getElementById("chat-container");
const peerIdContainer = document.getElementById("peer-id-container");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");
const sendPhotoBtn = document.getElementById("send-photo");
const locationBtn = document.getElementById("location-btn");
const distanceBtn = document.getElementById("distance-btn");
const buzzBtn = document.getElementById("buzz-btn");
const cameraBtn = document.getElementById("camera-btn");
const typingStatus = document.getElementById("typing-status");

let userLocation = null;
let otherUserLocation = null;

document.getElementById("start-chat").addEventListener("click", () => {
    userId = document.getElementById("user-id").value;
    userName = document.getElementById("user-name").value;
    
    // Validar si los campos no están vacíos antes de continuar
    if (userId && userName) {
        inicioDiv.style.display = "none";
        peerIdContainer.style.display = "block"; // Mostrar campo para ID del otro usuario
        chatContainer.style.display = "block";
        
        peer.on("open", (id) => {
            userId = id;
            console.log("ID de usuario: " + userId);
        });
    } else {
        alert("Por favor, ingresa un ID y un nombre.");
    }
});

// Función para conectar con el otro usuario usando la ID proporcionada
document.getElementById("connect-btn").addEventListener("click", () => {
    otherUserId = document.getElementById("other-user-id").value;
    if (otherUserId) {
        const conn = peer.connect(otherUserId);
        conn.on("open", () => {
            console.log(`Conectado con ${otherUserId}`);
            // Ahora el chat está listo para enviar mensajes
        });
        conn.on("data", (data) => {
            if (data.type === "message") {
                const msgElem = document.createElement("div");
                const time = new Date();
                msgElem.innerHTML = `<strong>${data.user}:</strong> ${data.message} <div class="message-time">${time.toLocaleString()}</div>`;
                messagesContainer.appendChild(msgElem);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });
    } else {
        alert("Por favor, ingresa la ID del otro usuario.");
    }
});

// Enviar un mensaje
function sendMessage(message) {
    if (message.trim()) {
        const msgElem = document.createElement("div");
        const time = new Date();
        msgElem.innerHTML = `<strong>Tu:</strong> ${message} <div class="message-time">${time.toLocaleString()}</div>`;
        messagesContainer.appendChild(msgElem);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Enviar un mensaje a otro usuario
sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value;
    sendMessage(message);
    const conn = peer.connect(otherUserId);
    conn.send({ type: "message", user: userName, message });
    messageInput.value = "";
});

// Compartir la ubicación
function compartirUbicacion() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
                const locationLink = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lon}`;
                localStorage.setItem("userLocation", JSON.stringify(userLocation));
                sendMessage(`Mi ubicación: ${locationLink}`);
                habilitarCalcularDistancia();
            },
            (error) => {
                sendMessage("No se pudo obtener la ubicación.");
            }
        );
    } else {
        alert("La geolocalización no está disponible.");
    }
}

// Habilitar el botón de calcular distancia si ambos comparten ubicación
function habilitarCalcularDistancia() {
    const otherUserLocation = JSON.parse(localStorage.getItem("otherUserLocation"));
    if (userLocation && otherUserLocation) {
        distanceBtn.disabled = false;
    }
}

// Calcular la distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calcular distancia entre ambos usuarios
distanceBtn.addEventListener("click", () => {
    const otherUserLocation = JSON.parse(localStorage.getItem("otherUserLocation"));
    if (userLocation && otherUserLocation) {
        const distancia = calcularDistancia(userLocation.lat, userLocation.lon, otherUserLocation.lat, otherUserLocation.lon);
        sendMessage(`La distancia entre las ubicaciones es: ${distancia.toFixed(2)} km`);
    }
});

// Recibir la ubicación del otro usuario
function recibirUbicacionDeOtroUsuario(lat, lon) {
    otherUserLocation = { lat, lon };
    localStorage.setItem("otherUserLocation", JSON.stringify(otherUserLocation));
    habilitarCalcularDistancia();
}

// Evento para compartir ubicación
locationBtn.addEventListener("click", compartirUbicacion);

// Simulación de recibir la ubicación de otro usuario (esto en la práctica se recibiría por mensajes)
recibirUbicacionDeOtroUsuario(34.052235, -118.243683); // Ejemplo de ubicación (otro usuario)

// Función de zumbido
buzzBtn.addEventListener("click", () => {
    navigator.vibrate(100);  // Vibración corta
});
