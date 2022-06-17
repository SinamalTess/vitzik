import React, { useEffect, useRef } from 'react'
import { drawRoundRect } from '../utils'
import { AlphabeticalNote, CanvasRectangle } from '../types'

interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
    duration: number // milliseconds
    id?: number
}

export interface VisualizerSectionProps {
    index: number
    indexToDraw: number
    indexCanvasPlaying: number
    height: number
    width: number
    top: string
    color: string
    notesCoordinates: NoteCoordinates[][]
    showCanvasNumbers?: boolean
}

function clearCanvas(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
}

function drawNumbers(ctx: CanvasRenderingContext2D, indexToDraw: number, index: number) {
    const { width, height } = ctx.canvas
    ctx.font = '30px Arial'
    ctx.fillText(indexToDraw.toString(), width - 40, height - 20)
    ctx.fillText(index.toString(), width - 80, height - 20)
}

function drawNotes(
    ctx: CanvasRenderingContext2D | undefined | null,
    notesCoordinates: NoteCoordinates[][],
    indexToDraw: number
) {
    if (!ctx) return
    const canvasOffset = ctx.canvas.height

    if (notesCoordinates[indexToDraw] && notesCoordinates[indexToDraw].length) {
        notesCoordinates[indexToDraw].forEach(({ x, y, w, h }) => {
            const yComputed = y - indexToDraw * canvasOffset
            drawRoundRect(ctx, x, yComputed, w, h, 5, true, false)
        })
    }
}

export function VisualizerSection({
    index,
    indexToDraw,
    height,
    width,
    color,
    top,
    notesCoordinates,
    showCanvasNumbers = true,
}: VisualizerSectionProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const canvasRef: HTMLCanvasElement | undefined | null = refCanvas.current
    const ctx = canvasRef?.getContext('2d')

    useEffect(() => {
        if (ctx) {
            clearCanvas(ctx)
            drawNotes(ctx, notesCoordinates, indexToDraw)
            if (showCanvasNumbers) {
                drawNumbers(ctx, indexToDraw, index)
            }
        }
    }, [clearCanvas, indexToDraw, notesCoordinates, showCanvasNumbers])

    useEffect(() => {
        function configureCanvas(color: string) {
            if (canvasRef && ctx) {
                canvasRef.width = width
                canvasRef.height = height
                ctx.fillStyle = color
            }
        }
        configureCanvas(color)
        if (width && height) {
            drawNotes(ctx, notesCoordinates, indexToDraw)
        }
    }, [width, height, ctx])

    return (
        <canvas
            ref={refCanvas}
            className={`visualizer__canvas visualizer__canvas--${index}`}
            style={{ transform: `scaleY(-1) translateY(${top})` }}
        ></canvas>
    )
}
