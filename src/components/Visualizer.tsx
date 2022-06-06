import React, { useRef } from 'react'
import { noteKeyToName } from '../utils'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'
import './Visualizer.scss'
import { isNoteOn, MidiJsonNote } from '../types'

export interface MidiInfos {
    ticksPerBeat: number
    msPerBeat: number
}

interface VisualizerProps {
    notes: MidiJsonNote[]
    color?: string
    midiInfos: MidiInfos | null
    trackPosition: number
    heightPerBeat?: number
}

interface CanvasRectangle {
    w: number // width
    h: number // height
    x: number
    y: number
}

function drawRectangles(ctx: CanvasRenderingContext2D, rectangles: CanvasRectangle[]) {
    rectangles.forEach(({ x, y, w, h }, index) => {
        ctx.fillRect(x, y, w, h)
    })
}

function getNotesCoordinates(
    widthCanvas: number,
    notes: MidiJsonNote[],
    heightPerBeat: number,
    midiInfos: MidiInfos
) {
    let rectangles: CanvasRectangle[] = []
    let deltaAcc = 0

    notes.forEach((note, index) => {
        deltaAcc = deltaAcc + note.delta

        if (isNoteOn(note)) {
            let heightAcc = 0
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

            const h = (heightAcc / midiInfos.ticksPerBeat) * heightPerBeat
            const y = (deltaAcc / midiInfos.ticksPerBeat) * heightPerBeat

            rectangles.push({
                w,
                h,
                x,
                y,
            })
        }
    })

    return rectangles
}

export function Visualizer({
    notes,
    color = '#00E2DC',
    trackPosition,
    heightPerBeat = 100,
    midiInfos,
}: VisualizerProps) {
    const canvasRef = useRef(null)

    if (canvasRef.current) {
        const canvas = canvasRef.current as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        const parentElement = canvas.parentElement
        const parentElementWidth = parentElement?.clientWidth ?? 0
        const parentElementHeight = parentElement?.clientHeight ?? 0
        if (midiInfos) {
            const rectangles = getNotesCoordinates(
                parentElementWidth,
                notes,
                heightPerBeat,
                midiInfos
            )
            // @ts-ignore
            // const canvasHeight = rectangles.reduce((acc, nextRectangle) => acc + nextRectangle.h, 0)
            canvas.width = parentElementWidth
            canvas.height = parentElementHeight

            if (ctx) {
                ctx.fillStyle = color
                drawRectangles(ctx, rectangles)
            }
        }
    }

    return (
        <div className="visualizer">
            <canvas
                className="visualizer__canvas"
                ref={canvasRef}
                style={{ transform: `translateY(${trackPosition}%) scaleY(-1)` }}
            ></canvas>
            <canvas
                className="visualizer__canvas_secondary"
                style={{ transform: `scaleY(-1)` }}
            ></canvas>
        </div>
    )
}
