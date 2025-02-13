import React, { useEffect, useState } from 'react'
import Soundfont, { InstrumentName } from 'soundfont-player'
import { msToSec } from '@/utils'
import {
    ActiveNote,
    AlphabeticalNote,
    AudioPlayerState,
    InstrumentUserFriendlyName,
    isMidiVisualizerActiveNote,
} from '@/types'
import {
    MIDI_INPUT_CHANNEL,
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FATBOY,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
    MIDI_INSTRUMENTS_MUSYNGKITE,
} from '@/const'
import { usePrevious } from '../../hooks'

interface InstrumentPlayerProps {
    audioContext: AudioContext
    midiInput?: MIDIInput | null
    isMute: boolean
    audioPlayerState: AudioPlayerState
    instrumentName: InstrumentUserFriendlyName
    activeNotes: ActiveNote[]
    notesToLoad: AlphabeticalNote[]
    soundfont?: SoundFont
    channel: number
    isDampPedalOn?: boolean
    onChangeLoadedInstrumentPlayers: React.Dispatch<
        React.SetStateAction<InstrumentUserFriendlyName[]>
    >
}

export type SoundFont = 'FluidR3_GM' | 'FatBoy' | 'MusyngKite'

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

const SOUNDFONT_DRUM_KIT_URL = 'soundfonts/pns_drum_kit.js'

export function InstrumentPlayer({
    isMute,
    midiInput,
    audioContext,
    instrumentName,
    notesToLoad,
    activeNotes,
    channel,
    audioPlayerState,
    soundfont = 'MusyngKite',
    isDampPedalOn = false,
    onChangeLoadedInstrumentPlayers,
}: InstrumentPlayerProps) {
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const prevActiveKeys = usePrevious<ActiveNote[]>(activeNotes)

    useEffect(() => {
        return function cleanup() {
            instrumentPlayer?.stop()
        }
    }, [])

    useEffect(() => {
        if (audioPlayerState === 'paused' || audioPlayerState === 'stopped') {
            instrumentPlayer?.stop()
        }
    }, [audioPlayerState])

    useEffect(() => {
        if (midiInput && instrumentPlayer && channel === MIDI_INPUT_CHANNEL) {
            /*
                This throws a warning in the console.
                There is not much we can do since this comes from the library.
                The warning is harmless though...
                See this : https://github.com/danigb/soundfont-player/issues/61
            */
            instrumentPlayer.listenToMidi(midiInput)
        }
    }, [instrumentPlayer, midiInput, channel])

    useEffect(() => {
        if (isMute) {
            return
        }
        function startInstrument() {
            let soundfontInstrument = normalizeInstrumentName(instrumentName, soundfont)
            if (instrumentName === 'Drum Kit') {
                // @ts-ignore
                soundfontInstrument = SOUNDFONT_DRUM_KIT_URL
            }
            Soundfont.instrument(audioContext, soundfontInstrument, {
                soundfont,
                notes: notesToLoad, // We pass only the notes required to play the midi song for better performances.
            })
                .then((instrumentPlayer) => {
                    setLoadedInstrumentPlayers()
                    setInstrumentPlayer(instrumentPlayer)
                })
                .catch(() => {
                    console.error(`Failed to start the instrument ${instrumentName} audio`)
                })
        }
        startInstrument()
    }, [instrumentName, isMute, soundfont])

    useEffect(() => {
        const sameChannelNotes = activeNotes.filter((note) => note.channel === channel)
        const shouldPlay =
            !isMute && sameChannelNotes.length && instrumentPlayer && channel !== MIDI_INPUT_CHANNEL // MIDI_INPUT_CHANNEL is handled by instrumentPlayer.listenToMidi

        if (!shouldPlay) return

        const isNewNote = (note: ActiveNote) =>
            !prevActiveKeys.find(
                (prevActiveKey) =>
                    'uniqueId' in prevActiveKey &&
                    'uniqueId' in note &&
                    prevActiveKey.uniqueId === note.uniqueId
            )

        const newNotes = sameChannelNotes.filter((note) => isNewNote(note))

        newNotes.forEach((note) => {
            playNote(note)
        })
    }, [activeNotes, instrumentPlayer, isMute])

    function setLoadedInstrumentPlayers() {
        onChangeLoadedInstrumentPlayers((loadedInstrumentPlayers) => {
            const existingInstrument = loadedInstrumentPlayers.findIndex(
                (loadedInstrumentPlayer) => loadedInstrumentPlayer === instrumentName
            )

            return existingInstrument >= 0
                ? [...loadedInstrumentPlayers]
                : [...loadedInstrumentPlayers, instrumentName]
        })
    }

    function playNote(note: ActiveNote) {
        if (!instrumentPlayer) return

        const { velocity, key } = note
        const gain = normalizeVelocity(velocity, 127, 0)
        const duration = isMidiVisualizerActiveNote(note) ? note.duration : 0

        instrumentPlayer.play(key.toString(), 0, {
            gain,
            duration: msToSec(duration),
            release: isDampPedalOn ? duration / 2 : 0,
        })
    }

    return null
}
