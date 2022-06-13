import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { convertCanvasRectToRect, getNotesCoordinates, isEven, isOverlapping } from '../utils'
import './Visualizer.scss'
import { MidiJsonNote, isHTMLCanvasElement, NoteCoordinates } from '../types'
import { isEqual } from 'lodash'
import { ActiveNote } from '../App'
import { usePrevious } from '../hooks'

export interface MidiTrackInfos {
    ticksPerBeat: number
    msPerBeat: number
    trackDuration: number
    notes: MidiJsonNote[]
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
        const note = convertCanvasRectToRect({ x, y, h, w })
        const isNoteInCanvas = isOverlapping(note, canvas)

        if (isNoteInCanvas) {
            let yComputed = y - canvasIndex * canvasOffset
            ctx.fillRect(x, yComputed, w, h)
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
    const [indexCanvas, setIndexCanvas] = useState<number>(0)
    const prevIndexCanvas = usePrevious(indexCanvas) ?? 0

    const width = visualizerRef?.current?.clientWidth ?? 0
    const height = visualizerRef?.current?.clientHeight ?? 0
    const canvasChildren = visualizerRef?.current?.childNodes ?? []
    const isIndexEven = isEven(indexCanvas)

    useEffect(() => {
        if (!midiTrackInfos) return
        const coordinates = getNotesCoordinates(width, notes, heightPerBeat, midiTrackInfos)
        setNotesCoordinates(coordinates)
    }, [midiTrackInfos])

    useEffect(() => {
        getActiveNotes(trackPosition)
    }, [trackPosition])

    useEffect(() => {
        if (indexCanvas === 0) {
            drawInitialState()
        } else if (prevIndexCanvas < indexCanvas) {
            drawBackward()
        } else {
            drawForward()
        }
    }, [indexCanvas, notesCoordinates])

    function drawInitialState() {
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
    }

    function drawForward() {
        const canvasToRedraw = isIndexEven ? 1 : 0
        if (canvasChildren[canvasToRedraw] && isHTMLCanvasElement(canvasChildren[canvasToRedraw])) {
            // @ts-ignore
            const ctx = canvasChildren[canvasToRedraw].getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, width, height)
                drawNotes(ctx, notesCoordinates, indexCanvas + 1)
            }
        }
    }

    function drawBackward() {
        const canvas1 = isIndexEven ? indexCanvas + 1 : indexCanvas
        const canvas0 = isIndexEven ? indexCanvas : indexCanvas + 1
        canvasChildren.forEach((child, i) => {
            if (isHTMLCanvasElement(child)) {
                const ctx = child.getContext('2d')

                if (ctx) {
                    ctx.clearRect(0, 0, width, height)
                    drawNotes(ctx, notesCoordinates, i === 0 ? canvas0 : canvas1)
                }
            }
        })
    }

    function calcTop(canvasIndex: number): string {
        if (midiTrackInfos && visualizerRef.current) {
            const { msPerBeat } = midiTrackInfos
            const nbBeatsPassed = trackPosition / msPerBeat
            const heightDuration = nbBeatsPassed * heightPerBeat
            const nbCanvasPassed = heightDuration / height
            const index = Math.floor(heightDuration / height)
            const isIndexEven = isEven(index)
            const percentageTop = Math.round((nbCanvasPassed % 1) * 100)
            const percentageFirstCanvas = `-${100 - percentageTop}%`
            const percentageSecondCanvas = `${percentageTop}%`
            if (index !== indexCanvas) {
                setIndexCanvas(() => index)
            }
            if (canvasIndex === 0) {
                return isIndexEven ? percentageSecondCanvas : percentageFirstCanvas
            } else {
                return isIndexEven ? percentageFirstCanvas : percentageSecondCanvas
            }
        }
        return '0px'
    }

    function getActiveNotes(trackPosition: number) {
        if (!midiTrackInfos) return

        const heightDuration = (trackPosition / midiTrackInfos.msPerBeat) * heightPerBeat
        const activeKeys = notesCoordinates
            .filter((note) => note.y <= heightDuration && note.y + note.h >= heightDuration)
            .map(({ name, velocity, id, duration, key }) => ({
                name,
                velocity,
                duration,
                id,
                key,
            }))

        if (!isEqual(activeKeys, activeNotes)) {
            setActiveNotes(activeKeys)
        }
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            <canvas
                className={`visualizer__canvas visualizer__canvas--0`}
                style={{ transform: `scaleY(-1)`, top: calcTop(0) }}
            ></canvas>
            <canvas
                className={`visualizer__canvas visualizer__canvas--1`}
                style={{ transform: `scaleY(-1)`, top: calcTop(1) }}
            ></canvas>
        </div>
    )
}
