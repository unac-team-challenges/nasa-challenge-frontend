import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { descargarTexto } from '@/features/ficha/utils/estudiante'
import { renderRuta } from '@/testing/render'
import { useApp } from '@/stores/app'

vi.mock('@/features/ficha/utils/estudiante', async (original) => ({
  ...(await original<typeof import('@/features/ficha/utils/estudiante')>()),
  descargarTexto: vi.fn(),
}))

async function abrirPanel() {
  renderRuta('/zona/20?perfil=estudiante')
  const informe = await screen.findByRole('complementary', { name: /informe/i })
  const titulo = await within(informe).findByRole('heading', { name: 'Llévatelo' })
  return within(titulo.closest('section')!)
}

describe('descargas del estudiante', () => {
  beforeEach(() => {
    vi.mocked(descargarTexto).mockClear()
    // El informe abierto y en español, como al entrar con una zona en la URL
    useApp.setState({ idioma: 'es', informeMin: false })
  })

  it('una zona entre dos años: el CSV trae solo esos años y la fuente arriba', async () => {
    const panel = await abrirPanel()
    await userEvent.selectOptions(panel.getByLabelText('Desde'), '2010')
    await userEvent.selectOptions(panel.getByLabelText('Hasta'), '2012')
    await userEvent.click(panel.getByRole('button', { name: /Tabla \(CSV\)/ }))

    const [nombre, texto] = vi.mocked(descargarTexto).mock.calls[0]
    expect(nombre).toBe('piura-lluvia-2010-2012.csv')
    const lineas = texto.split('\n')
    expect(lineas[0]).toMatch(/^# Fuente: NASA POWER/)
    expect(lineas.filter((l) => /^\d{4},/.test(l)).map((l) => l.slice(0, 4))).toEqual([
      '2010',
      '2011',
      '2012',
    ])
    expect(lineas).toContain('anio,lluvia_mm')
  })

  it('con el inicio después del final avisa y no deja descargar', async () => {
    const panel = await abrirPanel()
    await userEvent.selectOptions(panel.getByLabelText('Desde'), '2020')
    await userEvent.selectOptions(panel.getByLabelText('Hasta'), '2015')
    expect(panel.getByRole('alert')).toHaveTextContent(/no puede ser mayor/)
    expect(panel.getByRole('button', { name: /Tabla \(CSV\)/ })).toBeDisabled()
    expect(panel.getByRole('button', { name: /Gráfico \(PNG\)/ })).toBeDisabled()
  })

  it('un año con los 25 departamentos: 25 filas de ese año; sin elegir año, la tabla de tendencias', async () => {
    const panel = await abrirPanel()
    await userEvent.click(panel.getByRole('button', { name: /Un año, los 25 departamentos/ }))
    // En este modo no hay gráfico de una zona
    expect(panel.queryByRole('button', { name: /Gráfico \(PNG\)/ })).toBeNull()

    await userEvent.selectOptions(panel.getByLabelText('Año'), '2017')
    await userEvent.click(panel.getByRole('button', { name: /Tabla \(CSV\)/ }))
    const [nombre, texto] = vi.mocked(descargarTexto).mock.calls[0]
    expect(nombre).toBe('departamentos-lluvia-2017.csv')
    const filas = texto.split('\n').filter((l) => /^\d\d,/.test(l))
    expect(filas).toHaveLength(25)
    expect(filas.every((l) => l.split(',')[3] === '2017')).toBe(true)

    await userEvent.selectOptions(panel.getByLabelText('Año'), 'todo')
    await userEvent.click(panel.getByRole('button', { name: /Tabla \(CSV\)/ }))
    const [, tendencias] = vi.mocked(descargarTexto).mock.calls[1]
    expect(tendencias).toContain('id,departamento,region,pendiente_mm_decada')
  })
})
