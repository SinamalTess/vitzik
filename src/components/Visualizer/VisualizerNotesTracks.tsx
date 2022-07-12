import React from 'react'
import { useRef } from 'react'
import { NB_WHITE_PIANO_KEYS } from '../../utils/const'
import './VisualizerNotesTracks.scss'
import { getWidthWhiteKey } from '../../utils'
import clsx from 'clsx'

interface VisualizerTracksProps {
    height: number
    width: number
}

function drawLines(
    ctx: CanvasRenderingContext2D,
    containerDimensions: {
        h: number
        w: number
    }
) {
    const { h, w } = containerDimensions
    ctx.canvas.height = h
    ctx.canvas.width = w
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'

    const widthWhiteKey = getWidthWhiteKey(w)
    const margin = widthWhiteKey / 4

    for (let i = 0; i <= NB_WHITE_PIANO_KEYS; i++) {
        const x = widthWhiteKey * i - margin
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
    }
}

export function VisualizerNotesTracks({ height, width }: VisualizerTracksProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const canvasRef: HTMLCanvasElement | undefined | null = refCanvas.current
    const ctx = canvasRef?.getContext('2d')

    if (ctx) {
        drawLines(ctx, { h: height, w: width })
    }

    const classNames = clsx('visualizer__notes-tracks')

    return <canvas className={classNames} ref={refCanvas}></canvas>
}
