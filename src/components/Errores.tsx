import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/store'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

function Aviso({
  titulo,
  texto,
  children,
}: {
  titulo: string
  texto: string
  children?: React.ReactNode
}) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{titulo}</AlertTitle>
      <AlertDescription>
        <p className="m-0">{texto}</p>
        {children && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
      </AlertDescription>
    </Alert>
  )
}

const centrada = 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10'

/** Error al dibujar una pantalla (lo usa el router). Reintentar vuelve a cargarla. */
export function PantallaError({ reset }: ErrorComponentProps) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  return (
    <div className={centrada}>
      <Aviso titulo={t.errorH} texto={t.errorP}>
        <Button variant="default" onClick={reset}>
          {t.reintentar}
        </Button>
        <Button asChild>
          <Link to="/">{t.alInicio}</Link>
        </Button>
      </Aviso>
    </div>
  )
}

/** Ruta que no existe. */
export function NoEncontrada() {
  const t = TEXTOS[useApp((s) => s.idioma)]
  return (
    <div className={centrada}>
      <Aviso titulo={t.noEncontradaH} texto={t.noEncontradaP}>
        <Button asChild>
          <Link to="/">{t.alInicio}</Link>
        </Button>
      </Aviso>
    </div>
  )
}

/** La serie anual de una zona no llegó de la API: se avisa en el sitio del gráfico. */
export function ErrorSerie({ reintentar }: { reintentar: () => void }) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  return (
    <Aviso titulo={t.serieErrorH} texto={t.serieErrorP}>
      <Button variant="default" onClick={reintentar}>
        {t.reintentar}
      </Button>
    </Aviso>
  )
}
