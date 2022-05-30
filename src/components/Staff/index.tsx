import './staff.scss'
import React from 'react'
import Vex from 'vexflow'
import StaveNote = Vex.Flow.StaveNote
import Formatter = Vex.Flow.Formatter
import { NOTES } from '../../utils/const/notes'
import SVGContext = Vex.Flow.SVGContext
import { AlphabeticalNote } from '../../types/Notes'

interface StaffProps {
    notes: AlphabeticalNote[]
}

export function Staff({ notes }: StaffProps) {
    const { Renderer, Stave, StaveConnector, Voice } = Vex.Flow
    const musicSheet = React.useRef<HTMLDivElement>()
    const contextRef = React.useRef<Vex.IRenderContext | null>(null) // persists the context throughout renders to allow re-rendering of the notes only
    const trebleStaff = new Stave(0, 0, 400).addClef('treble')
    const bassStaff = new Stave(0, 75, 400).addClef('bass')

    const voice = new Voice({
        num_beats: 1,
        beat_value: 4,
    })

    const lineLeft = new StaveConnector(trebleStaff, bassStaff).setType(1)

    const lineRight = new StaveConnector(trebleStaff, bassStaff).setType(6)

    React.useEffect(() => {
        if (musicSheet.current) {
            const renderer = new Renderer(
                musicSheet.current,
                Renderer.Backends.SVG
            )

            renderer.resize(800, 400)

            contextRef.current = renderer.getContext()
            contextRef.current.scale(2, 2)
            contextRef.current.setFillStyle('white')

            trebleStaff.setContext(contextRef.current).draw()
            bassStaff.setContext(contextRef.current).draw()
            lineLeft.setContext(contextRef.current).draw()
            lineRight.setContext(contextRef.current).draw()
        }

        // Cleaning function (removes the whole musicsheet)
        return function () {
            if (musicSheet.current) {
                musicSheet.current.innerHTML = ''
            }
        }
    }, [])

    React.useEffect(() => {
        if (notes.length === 1 && contextRef.current) {
            // temporary
            const activeNotes: StaveNote[] = []

            notes.forEach((note) => {
                const isTopNote = NOTES.alphabetical.indexOf(note) >= 39 // middle C4 has index of 39 in NOTES
                const noteFormatted =
                    note.substring(0, 1) + '/' + note.substring(1, 2)

                activeNotes.push(
                    new StaveNote({
                        keys: [noteFormatted],
                        duration: 'q',
                        clef: isTopNote ? 'treble' : 'bass',
                    })
                )

                trebleStaff
                    .setContext(contextRef.current as Vex.IRenderContext)
                    .draw()

                bassStaff
                    .setContext(contextRef.current as Vex.IRenderContext)
                    .draw()
                voice.addTickables(activeNotes)
                new Formatter().joinVoices([voice]).format([voice], 200)
                voice.draw(
                    contextRef.current as Vex.IRenderContext,
                    isTopNote ? trebleStaff : bassStaff
                )
            })

            // Cleaning function, removes the last note
            return function () {
                const svgContext = (contextRef.current as SVGContext).svg
                if (svgContext.lastChild) {
                    svgContext.removeChild(svgContext.lastChild)
                }
            }
        }
    }, [notes])

    // @ts-ignore
    return <div id="musicSheet" ref={musicSheet}></div>
}
