import React, { useEffect } from 'react'
import { useRef } from 'react'
import { NB_WHITE_PIANO_KEYS } from '../../utils/const'
import './VisualizerTracks.scss'
import { getWidthWhiteKey } from '../../utils'

interface VisualizerTracksProps {
    height: number
    width: number
}

function drawLine(
    ctx: CanvasRenderingContext2D,
    containerDimensions: {
        h: number
        w: number
    }
) {
    const { h, w } = containerDimensions
    ctx.canvas.height = h
    ctx.canvas.width = w
    ctx.fillStyle = '#000'

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

export function VisualizerTracks({ height, width }: VisualizerTracksProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const canvasRef: HTMLCanvasElement | undefined | null = refCanvas.current
    const ctx = canvasRef?.getContext('2d')

    useEffect(() => {
        if (ctx) {
            drawLine(ctx, { h: height, w: width })
        }
    }, [ctx, height, width])

    return <canvas className={`visualizer__tracks`} ref={refCanvas}></canvas>
}
