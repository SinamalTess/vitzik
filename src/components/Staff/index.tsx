import './staff.scss'
import React from 'react'
import Vex from 'vexflow'
import StaveNote = Vex.Flow.StaveNote
import Formatter = Vex.Flow.Formatter

interface StaffProps {
    note: string | null
}

export function Staff({ note }: StaffProps) {
    const { Renderer, Stave } = Vex.Flow
    const musicSheet = React.useRef<HTMLElement>()

    React.useEffect(() => {
        if (musicSheet.current) {
            const renderer = new Renderer(
                musicSheet.current,
                Renderer.Backends.SVG
            )

            renderer.resize(400, 200)

            const context = renderer.getContext()

            context.scale(2, 2)
            context.setFillStyle('white')

            const stave = new Stave(0, 0, 150)

            stave.addClef('treble')
            stave.setContext(context).draw()

            const noteFormatted = note
                ? note.substring(0, 1).toLowerCase() +
                  '/' +
                  note.substring(1, 2).toLowerCase()
                : 'c/4'

            const notes = [
                new StaveNote({
                    keys: [noteFormatted],
                    duration: 'q',
                }),
            ]

            const voice = new Vex.Flow.Voice({ num_beats: 1, beat_value: 4 })

            voice.addTickables(notes)
            new Formatter().joinVoices([voice]).format([voice], 50)
            voice.draw(context, stave)
        }

        // Cleaning function
        return function () {
            if (musicSheet.current) {
                musicSheet.current.innerHTML = ''
            }
        }
    }, [note])

    return (
        // @ts-ignore
        <div ref={musicSheet}></div>
    )
}
