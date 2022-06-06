import React, { useRef } from 'react'
import { noteKeyToName } from '../utils'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'
import './Visualizer.scss'
import { isNoteOn, MidiJsonNote } from '../types'

interface VisualizerProps {
    notes: MidiJsonNote[]
    color?: string
    trackPosition: number
}

interface CanvasRectangle {
    w: number // width
    h: number // height
    x: number
    y: number
}

function drawRectangles(ctx: CanvasRenderingContext2D, rectangles: CanvasRectangle[]) {
    rectangles.forEach(({ x, y, w, h }) => {
        ctx.fillRect(x, y, w, h)
    })
}

function getNotesCoordinates(widthCanvas: number, notes: MidiJsonNote[]) {
    let rectangles: CanvasRectangle[] = []
    let deltaAcc = 0

    notes.forEach((note, index) => {
        let heightAcc = 0
        deltaAcc = deltaAcc + note.delta

        if (isNoteOn(note)) {
            const key = note.noteOn.noteNumber
            const noteName = noteKeyToName(key)
            const isBlackKey = noteName.includes('#')
            const noteOffIndex = notes.findIndex(
                (note, i) => !isNoteOn(note) && note.noteOff.noteNumber === key && i > index
            )
            const widthWhiteKey = widthCanvas / NB_WHITE_PIANO_KEYS
            const w = isBlackKey ? widthWhiteKey / 2 : widthWhiteKey
            const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
            const nbPreviousWhiteKeys = previousKeys.filter((note) => !note.includes('#')).length
            const margin = !isBlackKey ? widthWhiteKey / 4 : widthWhiteKey / 2
            const x = nbPreviousWhiteKeys * widthWhiteKey - margin

            if (noteOffIndex > 0) {
                for (let y = 0; y <= noteOffIndex - index; y++) {
                    heightAcc = heightAcc + notes[index + y].delta
                }
            }

            rectangles.push({
                w,
                h: heightAcc / 10,
                x,
                y: deltaAcc / 10,
            })
        }
    })

    return rectangles
}

export function Visualizer({ notes, color = '#00E2DC', trackPosition }: VisualizerProps) {
    const canvasRef = useRef(null)

    if (canvasRef.current) {
        const canvas = canvasRef.current as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        const parentElement = canvas.parentElement
        const parentElementWidth = parentElement?.clientWidth ?? 0
        const rectangles = getNotesCoordinates(parentElementWidth, notes)
        // @ts-ignore
        const canvasHeight = rectangles.reduce((acc, nextRectangle) => acc + nextRectangle.h, 0)
        canvas.width = parentElementWidth
        canvas.height = canvasHeight / 10 // until we optimize painting we can't render full track

        if (ctx) {
            ctx.fillStyle = color
            drawRectangles(ctx, rectangles)
        }
    }

    return (
        <div className="visualizer">
            <canvas
                className="visualizer__canvas"
                ref={canvasRef}
                style={{ transform: `translateY(${trackPosition}%) scaleY(-1)` }}
            ></canvas>
        </div>
    )
}
