# fix/aviso-en-ingles

## Corregido
- El aviso de la API (`stats.aviso`: IMERG 2014 y `lag1 > 0.5`) llegaba en español aunque la interfaz estuviera en inglés. Ahora, con la API como fuente e idioma inglés, la ficha lo arma en inglés con las mismas reglas del pipeline (`TEXTOS.en.avisoFijo`). En español se sigue mostrando el texto de la API.
- Sin cambios en el contrato ni en el backend.

## Notas
- Si el pipeline cambia las reglas del aviso, hay que actualizar `avisoFijo`. Alternativa sin duplicar reglas: que la API mande un código además del texto (cambia el contrato).
- Con la copia local el texto sale como antes: es técnico (`q=0.148; IC95 incluye 0`).

## Pendiente
- Nada.
