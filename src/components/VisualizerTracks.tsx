import React, { useEffect } from 'react'
import { useRef } from 'react'
import { NB_WHITE_PIANO_KEYS } from '../utils/const'
import './VisualizerTracks.scss'

interface VisualizerTracksProps {
    height: number
    width: number
}

export function VisualizerTracks({ height, width }: VisualizerTracksProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const canvasRef: HTMLCanvasElement | undefined | null = refCanvas.current
    const ctx = canvasRef?.getContext('2d')

    useEffect(() => {
        if (ctx) {
            ctx.canvas.height = height
            ctx.canvas.width = width
            ctx.fillStyle = '#000'

            const widthWhiteKey = width / NB_WHITE_PIANO_KEYS
            const margin = widthWhiteKey / 4

            for (let i = 0; i <= NB_WHITE_PIANO_KEYS; i++) {
                const x = widthWhiteKey * i - margin
                ctx.beginPath()
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
                ctx.stroke()
            }
        }
    }, [])

    return (
        <canvas className={`visualizer__tracks`} ref={refCanvas}>
            {' '}
        </canvas>
    )
}
