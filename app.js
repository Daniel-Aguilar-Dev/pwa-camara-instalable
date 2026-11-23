
let eventoInstalacionDiferido = null;

window.addEventListener('beforeinstallprompt', (event) => {
    // Evita que el mini-banner automático aparezca antes de tiempo
    event.preventDefault();
    eventoInstalacionDiferido = event;

    // Muestra tu botón personalizado de instalación en la UI
    const btnInstalar = document.getElementById('btn-instalar');
    btnInstalar.hidden = false;
});

// Evento para instalar la aplicación
const btnInstalar = document.getElementById('btn-instalar');

btnInstalar.addEventListener('click', () => {
    if (eventoInstalacionDiferido) {
        eventoInstalacionDiferido.prompt();

        eventoInstalacionDiferido.userChoice.then((resultado) => {
            if (resultado.outcome === 'accepted') {
                btnInstalar.hidden = true;
            }

            eventoInstalacionDiferido = null;
        });
    }
});

// Detección de iOS y modo instalado
function verificarEntornoIOS(){
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const estaInstalada = window.navigator.standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;

  // Si está en iPhone y aún la ve desde el navegador, mostrar instrucciones manuales
  if (esIOS && !estaInstalada) {
    const guiaIOS = document.getElementById('instrucciones-ios');
    if (guiaIOS) guiaIOS.hidden = false;
  }
}

let streamActual = null;
let modoCamaraActual = 'environment'; // 'environment' = trasera | 'user' = frontal

function detenerCamaraActiva(){
  if (streamActual) {
    streamActual.getTracks().forEach((track) => {
      track.stop();
    });
    streamActual = null;
  }
}

function iniciarCamara(modo){
  detenerCamaraActiva();

  const restricciones = {
    video: { facingMode: modo },
    audio: false
  };

  return navigator.mediaDevices.getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      const visorVideo = document.getElementById('visor-camara');
      visorVideo.srcObject = stream;
      actualizarMensajeEstado(`Cámara activa (${modo === 'environment' ? 'Trasera' : 'Frontal'})`);
    })
    .catch((error) => {
      if (error.name === 'NotAllowedError') {
        actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.');
      } else if (error.name === 'NotFoundError') {
        actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.');
      } else {
        actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`);
      }
    });
}

// Paso 1: El usuario pulsa "Solicitar Acceso a Cámara" -> Mostramos aviso explicativo
document.getElementById('btn-preparar-camara').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = false;
});

// Paso 2: El usuario lee el motivo y pulsa "Aceptar y Encender Cámara"
document.getElementById('btn-confirmar-permiso').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = true;
  iniciarCamara(modoCamaraActual);
});

// Función auxiliar para actualizar el mensaje de estado
function actualizarMensajeEstado(mensaje) {
    document.getElementById('mensaje-estado').textContent = mensaje;
}

// Evento para alternar entre cámara trasera y frontal
document.getElementById('btn-alternar-camara').addEventListener('click', () => {
    if (streamActual) {
        modoCamaraActual = modoCamaraActual === 'environment' ? 'user' : 'environment';
        iniciarCamara(modoCamaraActual);
    }
});

// Evento para apagar la cámara
document.getElementById('btn-apagar-camara').addEventListener('click', () => {
    detenerCamaraActiva();

    const visorVideo = document.getElementById('visor-camara');
    visorVideo.srcObject = null;

    actualizarMensajeEstado('Cámara apagada');
});

// Verificar si el dispositivo es iOS
verificarEntornoIOS();

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((registro) => {
            console.log('Service Worker registrado:', registro.scope);
        })
        .catch((error) => {
            console.log('Error al registrar Service Worker:', error);
        });
}
