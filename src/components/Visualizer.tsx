import React, { useRef, useState } from 'react'
import { convertCanvasRect, getNotesCoordinates, isOverlapping } from '../utils'
import './Visualizer.scss'
import { MidiJsonNote, isHTMLCanvasElement, NoteCoordinates, AlphabeticalNote } from '../types'
import { isEqual } from 'lodash'
import { ActiveNote } from '../App'

export interface MidiTrackInfos {
    ticksPerBeat: number
    msPerBeat: number
    trackDuration: number
}

interface VisualizerProps {
    activeNotes: ActiveNote[]
    notes: MidiJsonNote[]
    color?: string
    midiTrackInfos: MidiTrackInfos | null
    trackPosition: number
    heightPerBeat?: number
    setActiveNotes: (notes: ActiveNote[]) => void
}

function drawNotes(
    ctx: CanvasRenderingContext2D,
    notesCoordinates: NoteCoordinates[],
    canvasIndex: number
) {
    notesCoordinates.forEach(({ x, y, w, h }) => {
        //TODO: optimize this by not going through the whole array
        const canvasOffset = ctx.canvas.height
        const canvas = {
            x1: 0,
            x2: ctx.canvas.width,
            y1: canvasIndex * canvasOffset,
            y2: canvasIndex * canvasOffset + canvasOffset,
        }
        const note = convertCanvasRect({ x, y, h, w })
        const isNoteInCanvas = isOverlapping(note, canvas)

        if (isNoteInCanvas) {
            let yComputed = y - canvasIndex * canvasOffset
            let hComputed = h - canvasIndex * canvasOffset + (canvasIndex !== 0 ? canvasOffset : 0)
            ctx.fillRect(x, yComputed, w, hComputed)
        }
    })
}

export function Visualizer({
    activeNotes,
    notes,
    color = '#00E2DC',
    trackPosition,
    heightPerBeat = 100,
    midiTrackInfos,
    setActiveNotes,
}: VisualizerProps) {
    const visualizerRef = useRef<HTMLDivElement>(null)
    const [notesCoordinates, setNotesCoordinates] = useState<NoteCoordinates[]>([])
    const nbCanvas = 2

    const width = visualizerRef?.current?.clientWidth ?? 0
    const height = visualizerRef?.current?.clientHeight ?? 0
    const canvasChildren = visualizerRef?.current?.childNodes ?? []

    React.useEffect(() => {
        if (!midiTrackInfos) return
        const coordinates = getNotesCoordinates(width, notes, heightPerBeat, midiTrackInfos)
        setNotesCoordinates(coordinates)
    }, [midiTrackInfos])

    React.useEffect(() => {
        getActiveNotes(trackPosition)
    }, [trackPosition])

    React.useLayoutEffect(() => {
        canvasChildren.forEach((child, index) => {
            if (isHTMLCanvasElement(child)) {
                child.width = width
                child.height = height
                const ctx = child.getContext('2d')

                if (ctx) {
                    ctx.fillStyle = color
                    drawNotes(ctx, notesCoordinates, index)
                }
            }
        })
    }, [notesCoordinates])

    function calcTop(canvasIndex: number): string {
        if (midiTrackInfos && visualizerRef.current) {
            const heightDuration = (trackPosition / midiTrackInfos.msPerBeat) * heightPerBeat
            const heightCanvas = visualizerRef.current.clientHeight
            const percentageCanvas = heightDuration / heightCanvas
            if (canvasIndex === 0) {
                return percentageCanvas * heightCanvas + 'px'
            } else {
                return -heightCanvas + percentageCanvas * heightCanvas + 'px'
            }
        }
        return '0px'
    }

    function getActiveNotes(trackPosition: number) {
        if (!midiTrackInfos) return

        const heightDuration = (trackPosition / midiTrackInfos.msPerBeat) * heightPerBeat
        const activeKeys = notesCoordinates
            .filter((note) => note.y <= heightDuration && note.y + note.h >= heightDuration)
            .map(({ name, velocity }) => ({
                name,
                velocity,
            }))

        if (!isEqual(activeKeys, activeNotes)) {
            setActiveNotes(activeKeys)
        }
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            {Array(nbCanvas)
                .fill(null)
                .map((value, canvasIndex) => (
                    <canvas
                        className={`visualizer__canvas`}
                        style={{ transform: `scaleY(-1)`, top: calcTop(canvasIndex) }}
                        key={`visualizer__canvas` + canvasIndex}
                    ></canvas>
                ))}
        </div>
    )
}
