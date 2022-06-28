import React, { useEffect, useRef, useState } from 'react'
import Soundfont, { Player, InstrumentName } from 'soundfont-player'
import { msToSec } from '../../utils'
import {
    AudioPlayerState,
    MidiVisualizerActiveNote,
    InstrumentUserFriendlyName,
    ActiveNote,
    isMidiVisualizerActiveNote,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FATBOY,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
    MIDI_INSTRUMENTS_MUSYNGKITE,
} from '../../utils/const'

interface InstrumentPlayerProps {
    isMute: boolean
    instrument: InstrumentUserFriendlyName
    audioPlayerState: AudioPlayerState
    activeKeys: ActiveNote[]
    midiFile: IMidiFile | null
    soundfont?: SoundFont
    channel: number
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

function playNote(
    note: ActiveNote,
    notesAlreadyPlayed: MidiVisualizerActiveNote[],
    instrumentPlayer: Player
) {
    const { velocity, key } = note
    const gain = normalizeVelocity(velocity, 127, 0)
    if (isMidiVisualizerActiveNote(note)) {
        const { id, duration } = note
        const gain = normalizeVelocity(velocity, 127, 0)
        const isNoteAlreadyPlayed = notesAlreadyPlayed.find((note) => note.id === id)
        if (!isNoteAlreadyPlayed) {
            instrumentPlayer.play(key.toString(), 0, {
                gain,
                duration: msToSec(duration),
            })
            notesAlreadyPlayed.push(note)
        }
    } else {
        instrumentPlayer.play(key.toString(), 0, {
            gain,
            duration: msToSec(0),
        })
    }
}

export function InstrumentPlayer({
    isMute,
    instrument,
    audioPlayerState,
    activeKeys,
    midiFile,
    channel,
    soundfont = 'MusyngKite',
}: InstrumentPlayerProps) {
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const notesAlreadyPlayed: React.MutableRefObject<MidiVisualizerActiveNote[]> = useRef([])

    useEffect(() => {
        if (isMute) return

        function startInstrument() {
            const ac = new AudioContext()
            const soundfontInstrument = normalizeInstrumentName(instrument, soundfont)
            Soundfont.instrument(ac, soundfontInstrument, { soundfont })
                .then((instrumentPlayer) => {
                    setInstrumentPlayer(instrumentPlayer)
                    console.log('ready')
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
    }, [instrument, isMute, soundfont])

    useEffect(() => {
        const notes = activeKeys.filter((note) => note.channel === channel)
        if (isMute || !notes.length || !instrumentPlayer) return
        notes.forEach((note) => {
            playNote(note, notesAlreadyPlayed.current, instrumentPlayer)
        })
    }, [activeKeys, instrumentPlayer, isMute])

    useEffect(() => {
        if (audioPlayerState === 'rewinding') {
            notesAlreadyPlayed.current = []
        } else if (audioPlayerState === 'stopped') {
            notesAlreadyPlayed.current = []
        } else if (audioPlayerState === 'paused') {
            instrumentPlayer?.stop(0)
        }
    }, [audioPlayerState, instrumentPlayer])

    useEffect(() => {
        notesAlreadyPlayed.current = []
    }, [midiFile])

    return null
}
