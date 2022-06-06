import React, { useRef } from 'react'
import { CanvasRectangle, getCoordinates, isPointInRect, noteKeyToName } from '../utils'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'
import './Visualizer.scss'
import { isNoteOn, MidiJsonNote } from '../types'

export interface MidiTrackInfos {
    ticksPerBeat: number
    msPerBeat: number
}

interface VisualizerProps {
    notes: MidiJsonNote[]
    color?: string
    midiTrackInfos: MidiTrackInfos | null
    trackPosition: number
    heightPerBeat?: number
}

function isHTMLCanvasElement(element: ChildNode): element is HTMLCanvasElement {
    return element.nodeName === 'CANVAS'
}

function drawRectangles(
    ctx: CanvasRenderingContext2D,
    rectangles: CanvasRectangle[],
    canvasIndex: number
) {
    rectangles.forEach(({ x, y, w, h }) => {
        const canvasOffset = ctx.canvas.height
        const canvas = {
            x1: 0,
            x2: ctx.canvas.width,
            y1: canvasIndex * canvasOffset,
            y2: canvasIndex * canvasOffset + canvasOffset,
        }
        const coordinates = getCoordinates({ x, y, w, h })
        const isRectangleInCanvas = coordinates.some((coordinate) =>
            isPointInRect(canvas, { x: coordinate[0], y: coordinate[1] })
        )

        if (isRectangleInCanvas) {
            let yComputed = y - canvasIndex * canvasOffset
            let hComputed = h - canvasIndex * canvasOffset
            ctx.fillRect(x, yComputed, w, hComputed)
        }
    })
}

function getNotesCoordinates(
    canvasWidth: number,
    notes: MidiJsonNote[],
    heightPerBeat: number,
    midiInfos: MidiTrackInfos
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
            const widthWhiteKey = canvasWidth / NB_WHITE_PIANO_KEYS
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

            rectangles.push({ w, h, x, y })
        }
    })

    // const nbCanvas =
    //     rectangles.reduce((acc, nextRectangle) => acc + nextRectangle.h, 0) / canvas.height

    return rectangles
}

export function Visualizer({
    notes,
    color = '#00E2DC',
    trackPosition,
    heightPerBeat = 100,
    midiTrackInfos,
}: VisualizerProps) {
    const visualizerRef = useRef<HTMLDivElement>(null)
    const nbCanvas = 2
    if (visualizerRef.current) {
        const width = visualizerRef.current?.clientWidth ?? 0
        const height = visualizerRef.current?.clientHeight ?? 0
        const children = visualizerRef.current.childNodes

        children.forEach((child, index) => {
            if (isHTMLCanvasElement(child)) {
                child.width = width
                child.height = height
                const ctx = child.getContext('2d')

                if (midiTrackInfos) {
                    const rectangles = getNotesCoordinates(
                        width,
                        notes,
                        heightPerBeat,
                        midiTrackInfos
                    )

                    if (ctx) {
                        ctx.fillStyle = color
                        drawRectangles(ctx, rectangles, index)
                    }
                }
            }
        })
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            {Array(nbCanvas)
                .fill(null)
                .map((value, index) => (
                    <canvas
                        className={`visualizer__canvas`}
                        style={{ transform: `scaleY(-1)`, top: index === 1 ? '-100%' : 0 }}
                        key={`visualizer__canvas` + index}
                    ></canvas>
                ))}
        </div>
    )
}
