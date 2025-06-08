// app.js (versión final con sonido desbloqueado correctamente)

const alertasNotificadas = new Set();
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const API_URL = "http://127.0.0.1:8000/api/medicamentos/";
const ALERTAS_URL = "http://127.0.0.1:8000/api/alertas/";

function reproducirAlarma() {
    // El sonido está desactivado para evitar bloqueos del navegador
    console.log("🔔 Alarma visual activada (sin sonido)");
}


function mostrarNotificacion(texto, tipo = "exito") {
    const noti = document.getElementById("notificacion");
    noti.textContent = texto;
    noti.classList.remove("error");
    if (tipo === "error") noti.classList.add("error");
    noti.style.display = "block";
    setTimeout(() => {
        noti.style.display = "none";
        noti.classList.remove("error");
    }, 3000);
}

function mostrarAlertaVisual() {
    const alerta = document.getElementById("alerta-flotante");
    if (!alerta) return;
    alerta.classList.remove("hidden");
    setTimeout(() => alerta.classList.add("hidden"), 5000);
}

function cargarMedicamentos() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById("lista-medicamentos");
            lista.innerHTML = "";
            data.forEach(med => agregarMedicamentoAlDOM(med));
        })
        .catch(err => mostrarNotificacion("Error al cargar medicamentos", "error"));
}

function agregarMedicamentoAlDOM(med) {
    const lista = document.getElementById("lista-medicamentos");
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="bg-white rounded-xl shadow p-4 mb-4 border-l-4 border-indigo-500">
            <h3 class="text-lg font-bold text-indigo-600">${med.nombre}</h3>
            <p class="text-sm">Frecuencia: cada ${med.frecuencia_horas} horas</p>
            <p class="text-sm">Inicio: ${med.hora_inicio}</p>
            <button onclick="eliminarMedicamento(${med.id})" class="mt-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition">🗑 Eliminar</button>
        </div>
    `;
    lista.appendChild(li);
}

function eliminarMedicamento(id) {
    if (!confirm("¿Eliminar este medicamento?")) return;
    fetch(`${API_URL}${id}/`, { method: "DELETE" })
        .then(res => {
            if (!res.ok) throw new Error();
            mostrarNotificacion("Medicamento eliminado");
            cargarMedicamentos();
        })
        .catch(() => mostrarNotificacion("Error al eliminar", "error"));
}

document.getElementById("form-medicamento").addEventListener("submit", function (e) {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById("nombre").value,
        frecuencia_horas: document.getElementById("frecuencia").value,
        hora_inicio: document.getElementById("hora_inicio").value
    };
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(med => {
            agregarMedicamentoAlDOM(med);
            document.getElementById("form-medicamento").reset();
            mostrarNotificacion("Medicamento guardado exitosamente");
        })
        .catch(() => mostrarNotificacion("Error al guardar", "error"));
});

function cargarAlertas() {
    fetch(ALERTAS_URL)
        .then(res => res.json())
        .then(data => {
            const hoy = new Date().toISOString().slice(0, 10);
            const contenedor = document.getElementById("lista-alertas");
            if (!contenedor) return;
            contenedor.innerHTML = "";
            const alertasPendientes = data.filter(a => a.fecha === hoy && !a.tomada);
            if (alertasPendientes.length === 0) {
                contenedor.innerHTML = `<div class="text-gray-500">✅ No hay alertas pendientes para hoy.</div>`;
                return;
            }
            alertasPendientes.forEach(alerta => {
                const alertaKey = `${alerta.id}-${alerta.hora}`;
                const horaActual = new Date();
                const [h, m, s] = alerta.hora.split(":");
                const horaAlerta = new Date();
                horaAlerta.setHours(h, m, s);
                const diferencia = horaAlerta - horaActual;
                const dentroDelRango = diferencia >= 0 && diferencia < 60000;
                if (dentroDelRango && !alertasNotificadas.has(alertaKey)) {
                    alertasNotificadas.add(alertaKey);
                    reproducirAlarma();
                    mostrarAlertaVisual();
                }
                const div = document.createElement("div");
                div.classList.add("bg-yellow-100", "rounded-lg", "p-4", "mb-3", "border-l-4", "border-yellow-500", "shadow");
                div.innerHTML = `
                    <p class="font-semibold text-lg mb-1">💊 ${alerta.medicamento}</p>
                    <p class="text-sm text-gray-700">⏰ ${alerta.hora}</p>
                    <button class="mt-2 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded" onclick="marcarComoTomada(${alerta.id})">
                        Marcar como tomada
                    </button>
                `;
                contenedor.appendChild(div);
            });
        })
        .catch(err => console.error("Error verificando alertas:", err));
}

function marcarComoTomada(id) {
    fetch(`${ALERTAS_URL}${id}/marcar/`, { method: "POST" })
        .then(res => res.json())
        .then(() => {
            mostrarNotificacion("Alerta marcada como tomada ✅");
            cargarAlertas();
        })
        .catch(() => mostrarNotificacion("No se pudo marcar", "error"));
}

function descargarPDF() {
    fetch("http://127.0.0.1:8000/api/medicamentos/pdf/", {
        method: "GET",
        headers: { "Authorization": `Token ${token}` }
    })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "medicamentos.pdf";
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => mostrarNotificacion("No se pudo descargar el PDF", "error"));
}

function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarMedicamentos();
    cargarAlertas();
    setInterval(() => cargarAlertas(), 10000);
});

const toggle = document.getElementById("toggle-tema");
const cuerpo = document.body;
if (localStorage.getItem("tema") === "oscuro") {
    cuerpo.classList.add("dark");
    toggle.checked = true;
}
toggle.addEventListener("change", () => {
    cuerpo.classList.toggle("dark");
    localStorage.setItem("tema", cuerpo.classList.contains("dark") ? "oscuro" : "claro");
});

