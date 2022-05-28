import './staff.scss'
import React from 'react'
import Vex from 'vexflow'
import StaveNote = Vex.Flow.StaveNote
import Formatter = Vex.Flow.Formatter
import { KEYS } from '../../utils/const/keys'

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

            renderer.resize(800, 400)

            const context = renderer.getContext()

            context.scale(2, 2)
            context.setFillStyle('white')

            const trebleStaff = new Stave(0, 0, 400)
            const bassStaff = new Stave(0, 75, 400)

            trebleStaff.addClef('treble')
            bassStaff.addClef('bass')

            const lineLeft = new Vex.Flow.StaveConnector(
                trebleStaff,
                bassStaff
            ).setType(1)
            const lineRight = new Vex.Flow.StaveConnector(
                trebleStaff,
                bassStaff
            ).setType(6)

            trebleStaff.setContext(context).draw()
            bassStaff.setContext(context).draw()
            lineLeft.setContext(context).draw()
            lineRight.setContext(context).draw()

            if (note) {
                const isTopNote = KEYS.alphabetical.indexOf(note) >= 39 // middle C4 has index of 39 in KEYS
                const noteFormatted =
                    note.substring(0, 1) + '/' + note.substring(1, 2)
                const voice = new Vex.Flow.Voice({
                    num_beats: 1,
                    beat_value: 4,
                })
                const notes = [
                    new StaveNote({
                        keys: [noteFormatted],
                        duration: 'q',
                        clef: isTopNote ? 'treble' : 'bass',
                    }),
                ]

                voice.addTickables(notes)
                new Formatter().joinVoices([voice]).format([voice], 200)
                voice.draw(context, isTopNote ? trebleStaff : bassStaff)
            }
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
        <div id="musicSheet" ref={musicSheet}></div>
    )
}
