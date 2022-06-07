import React, { useRef } from 'react'
import { getCoordinates, getNotesCoordinates, isPartiallyIn } from '../utils'
import './Visualizer.scss'
import { MidiJsonNote, isHTMLCanvasElement, CanvasRectangle } from '../types'

export interface MidiTrackInfos {
    ticksPerBeat: number
    msPerBeat: number
    trackDuration: number
}

interface VisualizerProps {
    notes: MidiJsonNote[]
    color?: string
    midiTrackInfos: MidiTrackInfos | null
    trackPosition: number
    heightPerBeat?: number
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
        const isRectangleInCanvas = isPartiallyIn(coordinates, canvas)

        if (isRectangleInCanvas) {
            let yComputed = y - canvasIndex * canvasOffset
            let hComputed = h - canvasIndex * canvasOffset
            ctx.fillRect(x, yComputed, w, hComputed)
        }
    })
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
        const width = visualizerRef.current.clientWidth ?? 0
        const height = visualizerRef.current.clientHeight ?? 0
        const children = visualizerRef.current.childNodes
        let rectangles: CanvasRectangle[] = []
        if (midiTrackInfos) {
            rectangles = getNotesCoordinates(width, notes, heightPerBeat, midiTrackInfos)
        }

        children.forEach((child, index) => {
            if (isHTMLCanvasElement(child)) {
                child.width = width
                child.height = height
                const ctx = child.getContext('2d')

                if (ctx) {
                    ctx.fillStyle = color
                    drawRectangles(ctx, rectangles, index)
                }
            }
        })
    }

    function calcTop(index: number): string {
        if (midiTrackInfos && visualizerRef.current) {
            const heightDuration = (trackPosition / midiTrackInfos.msPerBeat) * heightPerBeat
            const heightCanvas = visualizerRef.current.clientHeight
            const percentageCanvas = heightDuration / heightCanvas
            if (index === 0) {
                return percentageCanvas * heightCanvas + 'px'
            } else {
                return -heightCanvas + percentageCanvas * heightCanvas + 'px'
            }
        }
        return '0'
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            {Array(nbCanvas)
                .fill(null)
                .map((value, index) => (
                    <canvas
                        className={`visualizer__canvas`}
                        style={{ transform: `scaleY(-1)`, top: calcTop(index) }}
                        key={`visualizer__canvas` + index}
                    ></canvas>
                ))}
        </div>
    )
}
