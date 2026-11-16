/** Shaders (GLSL) de la lluvia viva, las nubes y el suelo (movido de escena.ts sin cambios). */
import { DEPARTAMENTOS } from '@/data/datos'
import { ALTO_NUBE, DIR_ASTRO, DIR_LUZ, glsl, SOMBRA } from '@/features/mapa/escena/constantes'

/**
 * Lluvia viva y calor que sube, animados en la GPU: cada partícula tiene (x, z) fijos, una
 * fase, una velocidad y el índice de su departamento. La altura la calcula el shader con el
 * reloj y la altura actual del departamento (uTope); el CPU solo sube 26 números por cuadro.
 */
export const PARTICULAS_VS = `
uniform float uTime, uTam, uEscala, uCalor;
uniform float uTope[${DEPARTAMENTOS.length}];
attribute vec3 aSemilla; // x: fase 0..1, y: velocidad, z: departamento
varying float vA;
#include <fog_pars_vertex>
void main() {
  float tope = uTope[int(aSemilla.z + 0.5)];
  float h = uCalor > 0.5 ? 2.6 : 9.0;
  float f = fract(aSemilla.x + uTime * aSemilla.y / h);
  vec3 p = position;
  p.y = uCalor > 0.5 ? tope + h * f : tope + h * (1.0 - f);
  vA = uCalor > 0.5 ? sin(3.14159 * f) : smoothstep(0.0, 0.12, 1.0 - f) * smoothstep(0.0, 0.06, f);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uTam * uEscala / -mvPosition.z;
  #include <fog_vertex>
}`
export const PARTICULAS_FS = `
uniform vec3 uColor;
uniform float uOpacidad, uCalor;
varying float vA;
#include <fog_pars_fragment>
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float a = uCalor > 0.5
    ? 1.0 - smoothstep(0.12, 0.5, length(q))                                                // brillo redondo
    : (1.0 - smoothstep(0.03, 0.09, abs(q.x))) * (1.0 - smoothstep(0.15, 0.5, abs(q.y)));  // gota alargada
  a *= vA * uOpacidad;
  if (a < 0.02) discard;
  gl_FragColor = vec4(uColor, a);
  #include <fog_fragment>
}`

/**
 * Nubes de lluvia y su sombra: una sola geometría instanciada (x, z, departamento, peso) para las
 * dos pasadas. La altura sale de uTope y el vaivén de uTime, los mismos objetos que usan las gotas:
 * la GPU hace todo, el CPU no toca nada por cuadro.
 */
export const NUBE_VS = `
uniform float uTime;
uniform float uTope[${DEPARTAMENTOS.length}];
attribute vec4 aNube; // x, z, departamento, peso 0..1
varying vec2 vUv;
varying float vPeso;
const vec3 LUZ = ${glsl(DIR_LUZ)};
#include <fog_pars_vertex>
void main() {
  float tope = uTope[int(aNube.z + 0.5)];
  float tam = 1.6 + 2.0 * aNube.w; // chicas y translúcidas: nunca tapan el dato
  vec3 c = vec3(aNube.x + sin(uTime * 0.12 + aNube.x) * 0.6, tope + ${ALTO_NUBE.toFixed(1)}, aNube.y);
  vUv = uv;
  vPeso = aNube.w;
#ifdef SOMBRA
  // Plana sobre el departamento, corrida en sentido contrario a la luz
  c.xz -= LUZ.xz / LUZ.y * ${ALTO_NUBE.toFixed(1)};
  c.y = tope + 0.03;
  vec4 mvPosition = viewMatrix * vec4(c + vec3(position.x * 2.0, 0.0, -position.y) * tam, 1.0);
#else
  // Siempre de frente a la cámara
  vec4 mvPosition = viewMatrix * vec4(c, 1.0);
  mvPosition.xy += position.xy * vec2(2.0, 1.0) * tam;
#endif
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
export const NUBE_FS = `
uniform sampler2D uMapa;
uniform vec3 uColor;
varying vec2 vUv;
varying float vPeso;
#include <fog_pars_fragment>
void main() {
  float a = texture2D(uMapa, vUv).a;
#ifdef SOMBRA
  gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.14);
#else
  gl_FragColor = vec4(uColor * mix(1.0, 0.78, vPeso), a * 0.75); // más lluvia, nube más gris
#endif
  if (gl_FragColor.a < 0.01) discard;
  #include <fog_fragment>
}`

export const SUELO_VS = `
uniform sampler2D uMundo, uMundo2, uPeru;
uniform vec4 uCaja, uCajaPeru;
uniform float uRelieve;
varying vec3 vW;
#include <fog_pars_vertex>
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  // Relieve real de los vecinos (SRTM): sube solo la tierra, nunca dentro del Perú (ahí están las columnas)
  vec2 uv = (w.xz - uCaja.xy) / uCaja.zw;
  if (uRelieve > 0.0 && all(greaterThan(uv, vec2(0.0))) && all(lessThan(uv, vec2(1.0)))) {
    float tierra = smoothstep(0.5, 0.62, texture2D(uMundo, uv).g);
    float peru = texture2D(uPeru, (w.xz - uCajaPeru.xy) / uCajaPeru.zw).g;
    w.y += texture2D(uMundo2, uv).r * tierra * (1.0 - smoothstep(0.02, 0.3, peru)) * uRelieve;
  }
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
export const SUELO_FS = `
uniform float uTime;
uniform sampler2D uMundo, uMundo2, uPeru;
uniform vec4 uCaja, uCajaPeru;
uniform vec3 uHondo, uSomero, uEspuma, uSombra, uTierraBaja, uTierraAlta, uNieve, uAgua, uFrontera;
uniform vec3 uLuzColor;
uniform float uBrillo;
varying vec3 vW;
const vec3 LUZ = ${glsl(DIR_LUZ)};
const vec3 ASTRO = ${glsl(DIR_ASTRO)};
#include <fog_pars_fragment>
void main() {
  vec2 uv = (vW.xz - uCaja.xy) / uCaja.zw;
  vec3 t = texture2D(uMundo, uv).rgb;   // r: relieve (tierra) o profundidad (mar); g, b: costa
  vec3 t2 = texture2D(uMundo2, uv).rgb; // g: ríos y lagos; b: fronteras
  vec2 b2 = smoothstep(0.0, 0.04, uv) * smoothstep(0.0, 0.04, 1.0 - uv);
  float borde = b2.x * b2.y; // fuera de la caja el mar sigue
  float cerca = t.g * borde, lejos = t.b * borde, tierra = smoothstep(0.44, 0.56, cerca);
  vec3 mar = mix(uSomero, uHondo, smoothstep(0.05, 0.95, mix(0.6, t.r, borde)));
  mar = mix(mar, uSomero, smoothstep(0.05, 0.6, lejos) * 0.55);
  // Olas: cuatro ondas en direcciones distintas; altura y normal con fórmula exacta (sin texturas)
  vec2 p = vW.xz;
  const vec3 w1 = vec3(0.8, 0.6, 0.9), w2 = vec3(-0.5, 0.86, 1.4), w3 = vec3(0.2, -0.98, 2.3),
             w4 = vec3(-0.9, -0.44, 4.1);
#ifdef OLAS_SIMPLES
  // Celular: solo las dos ondas grandes (la mitad de senos por píxel)
  vec2 f = vec2(dot(p, w1.xy) * w1.z, dot(p, w2.xy) * w2.z) + uTime * vec2(0.9, 1.3);
  const vec2 amp = vec2(0.08, 0.055);
  vec2 c = amp * cos(f);
  vec2 g = w1.xy * w1.z * c.x + w2.xy * w2.z * c.y;
  float h = dot(amp, sin(f)) / (amp.x + amp.y); // -1..1
#else
  vec4 f = vec4(dot(p, w1.xy) * w1.z, dot(p, w2.xy) * w2.z, dot(p, w3.xy) * w3.z, dot(p, w4.xy) * w4.z)
         + uTime * vec4(0.9, 1.3, 1.9, 2.6);
  const vec4 amp = vec4(0.08, 0.055, 0.03, 0.015);
  vec4 c = amp * cos(f);
  vec2 g = w1.xy * w1.z * c.x + w2.xy * w2.z * c.y + w3.xy * w3.z * c.z + w4.xy * w4.z * c.w;
  float h = dot(amp, sin(f)) / dot(amp, vec4(1.0)); // -1..1
#endif
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vW);
  float olas = 1.0 - lejos * 0.6; // calmas junto a la costa, vivas mar adentro
  mar *= mix(1.0, 0.72 + 0.56 * max(dot(n, LUZ), 0.0), olas);                  // luz y sombra de cada ola
  mar = mix(mar, uHondo, (1.0 - smoothstep(-0.9, -0.2, h)) * 0.35 * olas);      // valles más hondos
  mar = mix(mar, uEspuma, smoothstep(0.25, 1.0, h) * 0.32 * olas);            // crestas claras
  mar = mix(mar, uSomero, pow(1.0 - max(v.y, 0.0), 4.0) * 0.3);               // fresnel: más claro al ras
  mar += uLuzColor * pow(max(dot(reflect(-ASTRO, n), v), 0.0), 40.0) * uBrillo; // camino de luz del sol o la luna
  float banda = smoothstep(0.1, 0.36, cerca) * (1.0 - smoothstep(0.4, 0.47, cerca));
  float corte = 0.6 + 0.4 * sin(p.x * 3.1 + uTime) * sin(p.y * 2.7 - uTime * 0.8); // espuma que se corta y viaja
  mar = mix(mar, uEspuma, banda * (0.45 + 0.3 * sin(cerca * 40.0 - uTime * 1.5)) * corte);
  // Color por altitud (t2.r = elevación / 6000 m), nieve solo sobre ~5200 m y sombreado real del relieve (t.r)
  vec3 suelo = mix(uTierraBaja, uTierraAlta, smoothstep(0.02, 0.7, t2.r));
  suelo = mix(suelo, uNieve, smoothstep(0.86, 0.95, t2.r));
  suelo *= 0.62 + 0.7 * t.r;
  suelo = mix(suelo, uAgua, t2.g * 0.55);
  suelo = mix(suelo, uFrontera, t2.b * 0.45);
  vec3 col = mix(mar, suelo, tierra);
  // sombra suave del Perú, corrida según la luz: los departamentos se "apoyan" en el suelo
  vec2 pv = (vW.xz + LUZ.xz / LUZ.y * ${SOMBRA.toFixed(2)} - uCajaPeru.xy) / uCajaPeru.zw;
  col = mix(col, uSombra, texture2D(uPeru, pv).r * 0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`
