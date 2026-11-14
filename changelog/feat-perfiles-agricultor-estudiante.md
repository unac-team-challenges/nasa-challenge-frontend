# feat/perfiles-agricultor-estudiante

PR: base `developer`. Autor: Favio.

## Resumen

Prepara el prototipo para la consulta con los mentores de UI/UX, con dos decisiones del equipo (14 nov):

1. **El público es solo agricultores y estudiantes.** Se quitan los perfiles "Municipalidad" y "Público general".
2. **La portada ya no muestra las franjas de años** (el resumen del Perú año por año): no se entendían a primera vista.

## Cambios

- `src/i18n/textos.ts`: el tipo `Perfil` queda en `'agricultor' | 'estudiante'`. Se quitan sus textos y frases (ES y EN) y los textos de las franjas de la portada.
- `src/store.ts`: el perfil por defecto pasa a **agricultor**, el de las frases más simples.
- `src/components/Ficha.tsx`: la frase de la ficha solo tiene esos dos casos.
- `src/components/Portada.tsx`: dos tarjetas de perfil, sin franjas. Se borra `FranjasPeru.tsx`, que solo se usaba ahí.
- Las franjas siguen en la máquina del tiempo, como riel de la barra.

## Pendiente

- Josue ajusta el contenido de cada perfil (qué datos y en qué orden ve cada uno).
