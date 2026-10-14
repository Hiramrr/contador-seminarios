"use strict";

const ZONA = "America/Mexico_City";
const DURACION_EN_VIVO_MS = 2 * 60 * 60 * 1000;
const UN_DIA_MS = 24 * 60 * 60 * 1000;
const UNA_HORA_MS = 60 * 60 * 1000;
const RECARGA_MS = 5 * 60 * 1000;

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});
const formatoHora = new Intl.DateTimeFormat("es-MX", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

let seminarios = [];
let cargado = false;
let mostrado = null;

function $(id) {
  return document.getElementById(id);
}

function preparar(datos) {
  return (Array.isArray(datos) ? datos : [])
    .filter((s) => s && s.titulo && s.ponente && !Number.isNaN(Date.parse(s.fecha)))
    .map((s) => ({
      titulo: String(s.titulo),
      ponente: String(s.ponente),
      lugar: s.lugar ? String(s.lugar) : "",
      inicio: Date.parse(s.fecha)
    }))
    .sort((a, b) => a.inicio - b.inicio);
}

// El primero que todavía no termina: está en curso si ya empezó, o es el próximo.
function seleccionar(ahora) {
  const evento = seminarios.find((s) => ahora < s.inicio + DURACION_EN_VIVO_MS);
  if (!evento) return null;
  return { evento, enVivo: ahora >= evento.inicio };
}

function mostrar(estado) {
  $("cargando").hidden = estado !== "cargando";
  $("vacio").hidden = estado !== "vacio";
  $("error").hidden = estado !== "error";
  $("evento").hidden = estado !== "evento";
  avisarAltura();
}

function setEtiqueta(texto, enCurso) {
  $("etiqueta").textContent = texto;
  $("etiqueta").classList.toggle("en-curso", enCurso);
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function pintarEvento(evento) {
  $("titulo").textContent = evento.titulo;
  $("ponente").textContent = evento.ponente;
  $("fecha").textContent = capitalizar(formatoFecha.format(new Date(evento.inicio))) +
    " · " + formatoHora.format(new Date(evento.inicio)) + " h";
  $("fecha").setAttribute("datetime", new Date(evento.inicio).toISOString());
  $("lugar").textContent = evento.lugar;
  $("detalle-lugar").hidden = !evento.lugar;
}

function dosDigitos(n) {
  return String(n).padStart(2, "0");
}

function pintarCuenta(diff) {
  const total = Math.max(0, diff);
  const dias = Math.floor(total / UN_DIA_MS);
  const horas = Math.floor((total % UN_DIA_MS) / UNA_HORA_MS);
  const minutos = Math.floor((total % UNA_HORA_MS) / 60000);
  const segundos = Math.floor((total % 60000) / 1000);

  $("dias").textContent = dosDigitos(dias);
  $("horas").textContent = dosDigitos(horas);
  $("minutos").textContent = dosDigitos(minutos);
  $("segundos").textContent = dosDigitos(segundos);
}

function actualizar() {
  if (!cargado) return;

  const ahora = Date.now();
  const seleccion = seleccionar(ahora);

  if (!seleccion) {
    setEtiqueta("Próximo seminario", false);
    mostrar("vacio");
    return;
  }

  const { evento, enVivo } = seleccion;
  if (evento !== mostrado) {
    mostrado = evento;
    pintarEvento(evento);
    mostrar("evento");
  }

  setEtiqueta(enVivo ? "En curso" : "Próximo seminario", enVivo);
  $("en-vivo").hidden = !enVivo;
  $("cuenta").hidden = enVivo;
  if (!enVivo) pintarCuenta(evento.inicio - ahora);
}

async function cargar() {
  try {
    const resp = await fetch("seminarios.json", { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    seminarios = preparar(await resp.json());
    cargado = true;
  } catch (error) {
    console.warn("No se pudo cargar seminarios.json:", error);
    if (!cargado) mostrar("error");
  }
}

cargar().then(actualizar);
setInterval(actualizar, 1000);
setInterval(cargar, RECARGA_MS);

// Avisa la altura a la página que incrusta el iframe para que se ajuste sin scroll.
function avisarAltura() {
  if (window.parent === window) return;
  const alto = Math.ceil(document.documentElement.getBoundingClientRect().height);
  window.parent.postMessage({ tipo: "contador-seminario-altura", alto }, "*");
}

if (window.parent !== window) {
  new ResizeObserver(avisarAltura).observe(document.body);
  window.addEventListener("load", avisarAltura);
}
