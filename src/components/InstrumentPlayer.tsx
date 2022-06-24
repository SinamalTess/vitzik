import React, { useEffect, useRef, useState } from 'react'
import Soundfont, { Player, InstrumentName } from 'soundfont-player'
import { msToSec } from '../utils'
import { AudioPlayerState, ActiveNote, InstrumentUserFriendlyName } from '../types'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FATBOY,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
    MIDI_INSTRUMENTS_MUSYNGKITE,
} from '../utils/const'

interface InstrumentPlayerProps {
    isMute: boolean
    instrument: InstrumentUserFriendlyName
    audioPlayerState: AudioPlayerState
    activeKeys: ActiveNote[]
    midiFile: IMidiFile | null
    soundfont?: SoundFont
}

type SoundFont = 'FluidR3_GM' | 'FatBoy' | 'MusyngKite'

const normalizeInstrumentName = (
    instrument: InstrumentUserFriendlyName,
    soundfont: SoundFont
): InstrumentName => {
    const InstrumentIndex = MIDI_INSTRUMENTS.findIndex(
        (midiInstrument) => midiInstrument === instrument
    )

    switch (soundfont) {
        case 'FatBoy':
            return MIDI_INSTRUMENTS_FATBOY[InstrumentIndex] as InstrumentName
        case 'FluidR3_GM':
            return MIDI_INSTRUMENTS_FLUIDR3_GM[InstrumentIndex] as InstrumentName
        case 'MusyngKite':
            return MIDI_INSTRUMENTS_MUSYNGKITE[InstrumentIndex] as InstrumentName
    }
}

const normalizeVelocity = (val: number, max: number, min: number): number =>
    (val - min) / (max - min)

function playNote(note: ActiveNote, notesAlreadyPlayed: ActiveNote[], instrumentPlayer: Player) {
    const { velocity, id, duration, key } = note
    const gain = normalizeVelocity(0, 1, velocity)
    const isNoteAlreadyPlayed = notesAlreadyPlayed.find((note) => note.id === id)
    if (!isNoteAlreadyPlayed) {
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
    midiFile,
    soundfont = 'MusyngKite',
}: InstrumentPlayerProps) {
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const notesAlreadyPlayed: React.MutableRefObject<ActiveNote[]> = useRef([])

    useEffect(() => {
        if (isMute || audioPlayerState !== 'playing') return

        function startInstrument() {
            const ac = new AudioContext()
            const soundfontInstrument = normalizeInstrumentName(instrument, soundfont)
            Soundfont.instrument(ac, soundfontInstrument, { soundfont })
                .then((instrumentPlayer) => {
                    setInstrumentPlayer(instrumentPlayer)
                })
                .catch(() => {
                    console.error(`Failed to start the instrument ${instrument} audio`)
                })
            return ac
        }

        const ac = startInstrument()

        return function cleanup() {
            ac.close().then(() => setInstrumentPlayer(null))
        }
    }, [instrument, isMute, audioPlayerState, soundfont])

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

    useEffect(() => {
        notesAlreadyPlayed.current = []
    }, [midiFile])

    return null
}
