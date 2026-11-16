# feat/aviso-fuente-local

## Qué cambia

- Si la sesión usa la API pero la vista que se está mirando sale de la copia local (periodo distinto del completo o «sin El Niño»), la ficha lo dice bajo el nombre de la zona: «Esta vista sale de la copia local; la API solo trae el periodo completo con El Niño, así que las cifras pueden diferir de la vista principal.» (ES/EN).
- Si toda la sesión es local no hay aviso: no hay cambio de fuente que avisar.

## Por qué

La lluvia de la API es GPM IMERG y la local es NASA POWER. Antes el cambio solo se notaba en el nombre de la fuente y en «Cómo lo sabemos» (cerrado en celular). Viene de `docs/para-favio.md` §3, opción a.

## Notas

- `mm/día` → `mm/año` ya se convierte al leer la API (`factorUnidad`); no hizo falta tocarlo.

## Pendiente

- Nada.
