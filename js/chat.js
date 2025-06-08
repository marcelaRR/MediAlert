const chatBox = document.getElementById("chat-box");
const form = document.getElementById("form-chat");
const input = document.getElementById("mensaje");

// Limpiar historial al cargar
let mensajes = []; // Ya no usamos localStorage

// Mostrar los mensajes
function renderizarMensajes() {
    chatBox.innerHTML = "";
    mensajes.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("p-2", "rounded", "w-fit", "max-w-[70%]");

        if (msg.tipo === "usuario") {
            div.classList.add("bg-indigo-100", "ml-auto");
        } else {
            div.classList.add("bg-gray-200");
        }

        div.innerHTML = msg.texto;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Respuestas del bot
function generarRespuesta(texto) {
    texto = texto.toLowerCase();

    if (texto.includes("hola")) return "¡Hola! ¿Cómo estás?";
    if (texto.includes("medicamento")) return "Recuerda tomarlo según lo programado 🕒";
    if (texto.includes("alerta")) return "Puedes marcar la alerta como tomada en el panel 🟢";
    
    // mensaje predetermiado de detectar dolor de estómago
    if (texto.includes("duele el estómago") || texto.includes("dolor de estómago") || texto.includes("estomago")) {
        return "Parece un malestar estomacal. Te recomiendo tomar omeprazol. Si deseas una receta médica, escribe 'pdf'.";
    }

    if (texto.includes("pdf")) {
        return {
            tipo: "pdf",
            mensaje: "Aquí tienes tu receta médica:",
            url: "http://127.0.0.1:8000/api/medicamentos/pdf/"
        };
    }

    return "Lo siento, aún estoy aprendiendo a responder eso 🤖";
}


// Enviar mensaje del bot con PDF
function enviarMensajeBotPDF(mensaje, linkPDF) {
    const respuestaHTML = `
        <p class="mb-1">${mensaje}</p>
        <a href="${linkPDF}" target="_blank" class="text-indigo-600 underline font-semibold">📥 Descargar PDF</a>
    `;
    mensajes.push({ tipo: "bot", texto: respuestaHTML });
    renderizarMensajes();
}

// Envío del formulario
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;

    mensajes.push({ tipo: "usuario", texto });
    renderizarMensajes();

    setTimeout(() => {
        const respuesta = generarRespuesta(texto);

        if (typeof respuesta === "string") {
            mensajes.push({ tipo: "bot", texto: respuesta });
            renderizarMensajes();
        } else if (respuesta.tipo === "pdf") {
            enviarMensajeBotPDF(respuesta.mensaje, respuesta.url);
        }
    }, 500);

    input.value = "";
});

// Inicial
renderizarMensajes(); // Carga vacío, sin historial
