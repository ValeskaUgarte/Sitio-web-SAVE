// Convierte una dirección de texto en coordenadas (lat/lng) usando Nominatim,
// el geocodificador gratuito de OpenStreetMap. No requiere API key ni tarjeta
// de crédito. Se usa para instalaciones futuras en hogares, empresas y
// comunidades, donde el administrador conoce la dirección pero no las
// coordenadas exactas.
//
// Límite de uso justo de Nominatim: máximo 1 solicitud por segundo y se debe
// enviar un User-Agent identificable (ambas cosas ya están cumplidas aquí).
// Para volúmenes altos de geocodificación, more adelante conviene evaluar un
// proveedor con SLA propio; para el uso puntual de este panel (un par de
// direcciones por vez, cargadas manualmente) es suficiente.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "SAVE-Sistema-Alerta-Vital/1.0 (panel de administración)";

async function geocodificarDireccion(direccion, comuna, region) {
  const query = [direccion, comuna, region, "Chile"].filter(Boolean).join(", ");
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=cl`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Servicio de geocodificación respondió ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) {
      return { encontrado: false, mensaje: "No se encontró esa dirección. Verifica que esté bien escrita o ingresa las coordenadas manualmente." };
    }
    return {
      encontrado: true,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      direccion_normalizada: data[0].display_name,
    };
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") {
      return { encontrado: false, mensaje: "El servicio de geocodificación tardó demasiado en responder. Intenta de nuevo o ingresa las coordenadas manualmente." };
    }
    return { encontrado: false, mensaje: "No se pudo contactar el servicio de geocodificación. Ingresa las coordenadas manualmente." };
  }
}

module.exports = { geocodificarDireccion };
