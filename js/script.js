const audio = document.querySelector(".header__audio");
const botonMusica = document.querySelector(".musica-flotante");
const iconoPlay = document.querySelector(".header__play");
const iconoPausa = document.querySelector(".header__pausa");

function pintarIcono(forzado) {
    if (!iconoPlay || !iconoPausa || !audio) return;
    const sonando = typeof forzado === "boolean" ? forzado : (!audio.paused && !audio.ended);
    if (sonando) {
        iconoPlay.setAttribute("hidden", "");
        iconoPausa.removeAttribute("hidden");
    } else {
        iconoPausa.setAttribute("hidden", "");
        iconoPlay.removeAttribute("hidden");
    }
    if (botonMusica) botonMusica.setAttribute("aria-label", sonando ? "Pausar" : "Reproducir");
}

function reproducirEntrada() {
    if (!audio) return;
    pintarIcono(true);
    const promesa = audio.play();
    if (promesa && typeof promesa.catch === "function") {
        promesa.catch(() => pintarIcono(false));
    }
}

if (botonMusica) {
    botonMusica.addEventListener("click", () => {
        if (audio.paused) {
            reproducirEntrada();
        } else {
            audio.pause();
            pintarIcono(false);
        }
    });
}

if (audio) {
    audio.addEventListener("play", () => pintarIcono(true));
    audio.addEventListener("playing", () => pintarIcono(true));
    audio.addEventListener("pause", () => pintarIcono(false));
    audio.addEventListener("ended", () => pintarIcono(false));
}

pintarIcono(false);

const numeroMonica = "543883138645";
const numeroLucky = "543853108631";
const campoNombre = document.querySelector("#userFullName");
const campoMensaje = document.querySelector("#customMessage");
const botonMonica = document.querySelector("#botoncito1");
const botonLucky = document.querySelector("#botoncito2");

function opcionElegida() {
    const elegido = document.querySelector('input[name="attendanceOption"]:checked');
    return elegido ? elegido.value : "";
}

function limpiarConfirmacion() {
    if (campoNombre) campoNombre.value = "";
    if (campoMensaje) campoMensaje.value = "";
    document.querySelectorAll('input[name="attendanceOption"]').forEach((radio) => {
        radio.checked = false;
    });
    ocultarErrores();
}

function mostrarError(id, mostrar) {
    const elemento = document.querySelector("#" + id);
    if (elemento) elemento.hidden = !mostrar;
}

function ocultarErrores() {
    mostrarError("errorasistencia", false);
    mostrarError("errornombre", false);
}

function enviarWhatsapp(numero) {
    const nombre = campoNombre ? campoNombre.value.trim() : "";
    const mensaje = campoMensaje ? campoMensaje.value.trim() : "";
    const asistencia = opcionElegida();
    let valido = true;
    if (!asistencia) {
        mostrarError("errorasistencia", true);
        valido = false;
    } else {
        mostrarError("errorasistencia", false);
    }
    if (!nombre) {
        mostrarError("errornombre", true);
        valido = false;
    } else {
        mostrarError("errornombre", false);
    }
    if (!valido) {
        if (!asistencia) {
            const primero = document.querySelector(".confirmacion__opciones");
            if (primero) primero.scrollIntoView({ block: "nearest" });
        } else if (campoNombre) {
            campoNombre.focus({ preventScroll: true });
        }
        return;
    }
    let texto = "Hola, soy " + nombre + ". " + asistencia + ".";
    if (mensaje) texto += " Mensaje: " + mensaje;
    const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener");
    limpiarConfirmacion();
}

document.querySelectorAll('input[name="attendanceOption"]').forEach((radio) => {
    radio.addEventListener("change", () => mostrarError("errorasistencia", false));
});

if (campoNombre) {
    campoNombre.addEventListener("input", () => mostrarError("errornombre", false));
}

if (botonMonica) {
    botonMonica.addEventListener("click", (evento) => {
        evento.preventDefault();
        enviarWhatsapp(numeroMonica);
    });
}

if (botonLucky) {
    botonLucky.addEventListener("click", (evento) => {
        evento.preventDefault();
        enviarWhatsapp(numeroLucky);
    });
}

const botonDatos = document.querySelector("#mostrarBoton");
const bloqueDatos = document.querySelector("#textoDesplegable");
const avisoCopiado = document.querySelector("#copyMessage");
let temporizadorAviso = null;

if (botonDatos && bloqueDatos) {
    let temporizadorCierre = null;
    botonDatos.addEventListener("click", () => {
        const abierto = bloqueDatos.classList.contains("abierto");
        if (abierto) {
            bloqueDatos.classList.remove("abierto");
            botonDatos.setAttribute("aria-expanded", "false");
            botonDatos.textContent = "Ver datos bancarios";
            if (temporizadorCierre) clearTimeout(temporizadorCierre);
            temporizadorCierre = setTimeout(() => {
                if (!bloqueDatos.classList.contains("abierto")) bloqueDatos.hidden = true;
            }, 550);
        } else {
            if (temporizadorCierre) clearTimeout(temporizadorCierre);
            bloqueDatos.hidden = false;
            void bloqueDatos.offsetHeight;
            requestAnimationFrame(() => bloqueDatos.classList.add("abierto"));
            botonDatos.setAttribute("aria-expanded", "true");
            botonDatos.textContent = "Ocultar datos bancarios";
        }
    });
}

function mostrarAviso() {
    if (!avisoCopiado) return;
    avisoCopiado.hidden = false;
    if (temporizadorAviso) clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        avisoCopiado.hidden = true;
    }, 1500);
}

const tiemposCopiado = new WeakMap();

function mostrarCopiado(boton) {
    mostrarAviso();
    if (!boton) return;
    const etiqueta = boton.querySelector(".regalos__leyenda");
    if (!etiqueta) return;
    if (!boton.dataset.original) boton.dataset.original = etiqueta.textContent;
    etiqueta.textContent = "¡Copiado!";
    if (tiemposCopiado.has(boton)) clearTimeout(tiemposCopiado.get(boton));
    tiemposCopiado.set(boton, setTimeout(() => {
        etiqueta.textContent = boton.dataset.original;
    }, 1500));
}

function copiarTexto(valor, boton) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        return navigator.clipboard.writeText(valor).then(() => mostrarCopiado(boton)).catch(() => copiarRespaldo(valor, boton));
    }
    copiarRespaldo(valor, boton);
}

function copiarRespaldo(valor, boton) {
    const temporal = document.createElement("textarea");
    temporal.value = valor;
    temporal.setAttribute("readonly", "");
    temporal.style.position = "fixed";
    temporal.style.opacity = "0";
    document.body.appendChild(temporal);
    temporal.select();
    try {
        document.execCommand("copy");
        mostrarCopiado(boton);
    } catch (error) {
        // sin aviso si el navegador lo bloquea
    }
    document.body.removeChild(temporal);
}

document.querySelectorAll('[data-copiar]').forEach((boton) => {
    boton.addEventListener("click", () => {
        const id = boton.getAttribute("data-copiar");
        const fuente = id ? document.getElementById(id) : null;
        if (!fuente) return;
        copiarTexto(fuente.textContent.trim(), boton);
    });
});


// ----------------------- temporizador ---------------------------------
// Configura aquí la fecha objetivo usando el formato de texto en inglés
// Ejemplo: "Month Day, Year HH:MM:SS" -> "July 1, 2026 22:00:00"
const fecha_objetivo = new Date("december 19, 2026 21:00:00").getTime();

const actualizar_temporizador = () => {
    const dias = document.getElementById("dias");
    const horas = document.getElementById("horas");
    const minutos = document.getElementById("minutos");

    if (!dias || !horas || !minutos) return;

    const ahora = new Date().getTime();
    const diferencia = fecha_objetivo - ahora;

    if (diferencia <= 0) {
        // Si la fecha ya pasó
        dias.innerText = "00";
        horas.innerText = "00";
        minutos.innerText = "00";
        return;
    }

    // Cálculos matemáticos
    const totalDias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const totalHoras = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const totalMinutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    // Actualizar DOM con ceros a la izquierda
    dias.innerText = totalDias < 10 ? "0" + totalDias : totalDias;
    horas.innerText = totalHoras < 10 ? "0" + totalHoras : totalHoras;
    minutos.innerText = totalMinutos < 10 ? "0" + totalMinutos : totalMinutos;
};

// Ejecutar inmediatamente y luego cada 1 segundo
actualizar_temporizador();
setInterval(actualizar_temporizador, 1000);


// --------------------------- splash -------------------------------

document.addEventListener('DOMContentLoaded', function () {
  const splash = document.getElementById('splash');
  const sobre = document.querySelector('.splash__sobre');

  if (sobre && splash) {
    sobre.addEventListener('click', function () {
      reproducirEntrada();
      splash.classList.add('oculto');
      splash.addEventListener('transitionend', function () {
        splash.style.display = 'none';
      });
    });
  }
});