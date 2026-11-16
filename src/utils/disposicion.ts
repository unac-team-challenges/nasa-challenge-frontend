/**
 * Alto del mapa en celular (arriba, con el texto debajo). En escritorio el mapa es el fondo.
 * Mínimo 320 px, salvo en pantallas bajas (celular acostado, zoom): ahí deja 8rem a la cabecera
 * para que el mapa y su barra de tiempo entren enteros sin bajar.
 */
export const ALTO_MAPA_CELULAR = 'h-[max(60svh,min(320px,100svh-8rem))]'

/** Celular = todo lo que no es escritorio. Igual que las variantes `celular`/`escritorio` de index.css. */
export const MQ_CELULAR = 'not all and (min-width: 901px) and (min-height: 560px)'
