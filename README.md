# Contador regresivo de seminarios · Doctorado en Ciencias de la Computación UV

Tarjeta con la cuenta regresiva para el próximo seminario. Es un sitio estático (HTML, CSS y JavaScript sin dependencias) que se publica en GitHub Pages y se incrusta en WordPress con un iframe.

## Archivos

| Archivo | Función |
| --- | --- |
| `index.html` | Estructura de la tarjeta |
| `styles.css` | Diseño y adaptación a celular |
| `script.js` | Cuenta regresiva y selección del próximo seminario |
| `seminarios.json` | Lista de seminarios, editable |

## Modificar los seminarios

Edita `seminarios.json`. Es un arreglo; la página muestra sola el próximo seminario.

```json
[
  {
    "titulo": "Hacia una UX Accesible: Evaluando Software con la Comunidad Sorda",
    "ponente": "Andrés Eduardo Fuentes Cortázar",
    "fecha": "2026-10-15T13:00:00-06:00",
    "lugar": "Audiovisual FEI UV, Facultad de Estadística e Informática"
  }
]
```

- `titulo` y `ponente`: obligatorios.
- `fecha`: obligatoria, en formato `AAAA-MM-DDTHH:MM:SS-06:00`. Veracruz no usa horario de verano, así que el offset es `-06:00` todo el año.
- `lugar`: opcional. Si lo dejas vacío, la línea no se muestra.

Para agregar un seminario, copia un bloque, cambia sus datos y pon una coma entre bloques. Valida el JSON en [jsonlint.com](https://jsonlint.com) antes de publicar: un error de sintaxis deja la tarjeta en modo de error.

Comportamiento automático:

- Antes del seminario: muestra días, horas, minutos y segundos.
- Durante las 2 horas siguientes al inicio: muestra "¡El seminario está comenzando!".
- Después de esas 2 horas: pasa al siguiente seminario de la lista.
- Sin seminarios futuros: muestra "Por anunciar".
- Recarga `seminarios.json` cada 5 minutos, así que no hace falta recargar la página al editarlo.

## Probar en tu computadora

El navegador no carga `seminarios.json` desde `file://`, así que usa un servidor local:

```bash
cd contadorSeminario
python3 -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000).

## Publicar en GitHub Pages

1. Sube los archivos a la rama `main` del repositorio `contador-seminarios`.
2. En el repositorio, ve a Settings → Pages → "Deploy from a branch", rama `main`, carpeta `/ (root)`, y guarda.
3. La URL pública queda como `https://hiramrr.github.io/contador-seminarios/`.

Para actualizar un seminario, edita `seminarios.json` y sube el cambio. La página se actualiza sola en unos minutos.

## Insertar en WordPress

En la entrada o página, agrega un bloque HTML personalizado y pega:

```html
<iframe
  src="https://hiramrr.github.io/contador-seminarios/"
  width="100%"
  height="450"
  style="border:0; display:block;"
  title="Próximo seminario DCC"
  loading="lazy">
</iframe>
```

Si ves cortada la tarjeta en pantallas angostas, aumenta `height` a 560.

## Accesibilidad

- HTML semántico: `h1`, `dl` para los datos y `time` para la fecha.
- El estado se comunica con texto, no solo con color.
- El contador no se anuncia en el lector de pantalla cada segundo.
