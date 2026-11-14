// Pantalla provisional: confirma que Tailwind, las fuentes y los tokens cargan.
// Se reemplaza al portar el prototipo v2 (portada y explorador).
export default function App() {
  return (
    <main className="grid min-h-screen place-items-center p-4 text-center">
      <div>
        <h1 className="font-display text-5xl">Detective del Perú</h1>
        <p className="mt-2">NASA Space Apps Challenge 2026 · En construcción</p>
        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
          <span className="size-6 rounded bg-map-up" />
          <span className="size-6 rounded bg-map-down" />
          <span className="size-6 rounded bg-map-green" />
          <span className="size-6 rounded bg-accent" />
        </div>
      </div>
    </main>
  )
}
