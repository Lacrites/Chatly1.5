// Inicialización de variables
const startScreen = document.getElementById('start-screen');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const buzzBtn = document.getElementById('buzz-btn');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const focusBtn = document.getElementById('focus-btn');
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const cameraContainer = document.getElementById('camera-container');
const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');

// Variables de PeerJS
let peer, conn;

// Detectar cuando el usuario está escribiendo
let typingTimeout;
messageInput.addEventListener('input', () => {
    // Enviar que el usuario está escribiendo
    conn.send({ type: "typing", data: true });
    
    // Mostrar el indicador de "escribiendo..."
    typingIndicator.style.display = "block";
    
    // Ocultar después de 1 segundo de inactividad
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.style.display = "none";
    }, 1000);
});

// Función para enviar el mensaje
sendBtn.addEventListener('click', () => {
    sendMessage(messageInput.value);
    messageInput.value = ''; // Limpiar el campo de entrada
});

// Función para enviar el mensaje y agregarlo al chat
function sendMessage(message) {
    const messageTime = new Date();
    const formattedTime = messageTime.toLocaleString();  // Ej. 10:30 AM - 09/05/2025
    
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    
    const content = document.createElement("div");
    content.classList.add("message-content");
    content.textContent = message;

    const time = document.createElement("div");
    time.classList.add("message-time");
    time.textContent = formattedTime;

    messageElement.appendChild(content);
    messageElement.appendChild(time);
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;  // Desplazar hacia abajo
}

// Recibir datos del otro usuario (mensaje o "escribiendo...")
conn.on('data', (data) => {
    if (data.type === "typing" && data.data) {
        typingIndicator.style.display = "block";
    } else if (data.type === "message") {
        sendMessage(data.message);
    }
});

// Función para iniciar la conexión cuando el usuario presiona "Iniciar"
document.getElementById('start-btn').addEventListener('click', () => {
    const userId = userIdInput.value;
    const userName = userNameInput.value;
    
    if (userId && userName) {
        startScreen.style.display = "none";
        chatContainer.style.display = "block";

        // Crear el objeto Peer
        peer = new Peer(userId);
        
        peer.on('open', (id) => {
            console.log("Conexión establecida. Tu ID: " + id);
        });

        peer.on('connection', (connection) => {
            conn = connection;
            conn.on('open', () => {
                console.log('Conexión con el otro usuario establecida');
            });
        });

        // Conectar con el otro usuario
        peer.on('call', (call) => {
            // Responder al llamado (si tienes video)
            call.answer(window.localStream);
        });
    } else {
        alert('Por favor ingresa tu ID y nombre.');
    }
});

// Enviar Zumbido
buzzBtn.addEventListener('click', () => {
    conn.send({ type: "buzz", data: true });
});

// Mostrar/Ocultar Cámara
focusBtn.addEventListener('click', () => {
    if (cameraContainer.style.display === "none") {
        cameraContainer.style.display = "block";
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => console.log("Error accediendo a la cámara: " + err));
    } else {
        cameraContainer.style.display = "none";
        video.srcObject.getTracks().forEach(track => track.stop());
    }
});

// Capturar Foto
captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aquí podrías enviar la imagen por PeerJS si quieres

    console.log("Foto Capturada");
});
