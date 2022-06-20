import React, { useEffect, useRef, useState } from 'react'
import Soundfont, { InstrumentName, Player } from 'soundfont-player'
import { ActiveNote } from '../App'
import { msToSec } from '../utils'
import { AudioPlayerState, Instrument } from '../types'

interface InstrumentPlayerProps {
    isMute: boolean
    instrument: Instrument
    audioPlayerState: AudioPlayerState
    activeKeys: ActiveNote[]
}

const normalizeInstrumentName = (instrument: Instrument): InstrumentName =>
    instrument.replace(/ /g, '_').toLowerCase() as InstrumentName

const normalizeVelocity = (val: number, max: number, min: number): number =>
    (val - min) / (max - min)

function playNote(note: ActiveNote, notesAlreadyPlayed: ActiveNote[], instrumentPlayer: Player) {
    const { velocity, id, duration, key } = note
    const gain = normalizeVelocity(0, 1, velocity)
    if (!notesAlreadyPlayed.find((note) => note.id === id)) {
        instrumentPlayer.play(key.toString(), 0, {
            gain,
            duration: msToSec(duration ?? 0),
        })
        notesAlreadyPlayed.push(note)
    }
}

export function InstrumentPlayer({
    isMute,
    instrument,
    audioPlayerState,
    activeKeys,
}: InstrumentPlayerProps) {
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const notesAlreadyPlayed: React.MutableRefObject<ActiveNote[]> = useRef([])

    useEffect(() => {
        if (isMute || audioPlayerState !== 'playing') return
        const ac = startInstrument()

        return function cleanup() {
            ac.close().then(() => setInstrumentPlayer(null))
        }
    }, [instrument, isMute, audioPlayerState])

    useEffect(() => {
        if (isMute || !activeKeys.length || !instrumentPlayer) return
        activeKeys.forEach((note) => {
            playNote(note, notesAlreadyPlayed.current, instrumentPlayer)
        })
    }, [activeKeys, instrumentPlayer, isMute])

    useEffect(() => {
        if (audioPlayerState === 'rewinding' || audioPlayerState === 'stopped') {
            notesAlreadyPlayed.current = []
        }
    }, [audioPlayerState])

    function startInstrument() {
        const ac = new AudioContext()
        const SoundfontInstrument = normalizeInstrumentName(instrument)
        Soundfont.instrument(ac, SoundfontInstrument, { soundfont: 'FluidR3_GM' })
            .then((instrumentPlayer) => {
                setInstrumentPlayer(instrumentPlayer)
            })
            .catch(() => {
                console.error(`Failed to start the instrument ${instrument} audio`)
            })
        return ac
    }

    return null
}
