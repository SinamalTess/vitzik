import React, { useEffect, useRef } from 'react'
import { drawRoundRect } from '../utils'
import { NoteCoordinates } from '../types'
import './VisualizerSection.scss'
import { CHANNElS_COLORS } from '../utils/const/channel_colors'
import clsx from 'clsx'

export interface VisualizerSectionProps {
    index: number
    indexToDraw: number
    height: number
    width: number
    top: string
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
        notesCoordinates[indexToDraw].forEach(({ x, y, w, h, channel }) => {
            const yComputed = y - indexToDraw * canvasOffset
            ctx.fillStyle = CHANNElS_COLORS[channel]
            drawRoundRect(ctx, x, yComputed, w, h, 5, true, false)
        })
    }
}

export function VisualizerSection({
    index,
    indexToDraw,
    height,
    width,
    top,
    notesCoordinates,
    showCanvasNumbers = true,
}: VisualizerSectionProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const canvasRef: HTMLCanvasElement | undefined | null = refCanvas.current
    const ctx = canvasRef?.getContext('2d')

    useEffect(() => {
        if (ctx && notesCoordinates) {
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
        configureCanvas(CHANNElS_COLORS[0])
        if (width && height) {
            drawNotes(ctx, notesCoordinates, indexToDraw)
        }
    }, [width, height, ctx])

    const className = clsx('visualizer__section', [`visualizer__section--${index}`])

    return (
        <canvas
            ref={refCanvas}
            data-testid={`visualizer__section--${index}`}
            className={className}
            style={{ transform: `scaleY(-1) translateY(${top})` }}
        ></canvas>
    )
}
