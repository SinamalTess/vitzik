import { useEffect, useState } from 'react'
import Soundfont, { Player, InstrumentName } from 'soundfont-player'
import { msToSec } from '../../utils'
import { InstrumentUserFriendlyName, ActiveNote, isMidiVisualizerActiveNote } from '../../types'
import {
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FATBOY,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
    MIDI_INSTRUMENTS_MUSYNGKITE,
} from '../../utils/const'
import { usePrevious } from '../../_hooks'

interface InstrumentPlayerProps {
    isMute: boolean
    instrument: InstrumentUserFriendlyName
    activeKeys: ActiveNote[]
    notes: string[]
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

function playNote(note: ActiveNote, instrumentPlayer: Player) {
    const { velocity, key } = note
    const gain = normalizeVelocity(velocity, 127, 0)
    const duration = isMidiVisualizerActiveNote(note) ? note.duration : 0
    instrumentPlayer.play(key.toString(), 0, {
        gain,
        duration: msToSec(duration),
    })
}

export function InstrumentPlayer({
    isMute,
    instrument,
    notes,
    activeKeys,
    channel,
    soundfont = 'MusyngKite',
}: InstrumentPlayerProps) {
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const prevActiveKeys = usePrevious(activeKeys)

    useEffect(() => {
        if (isMute) return

        function startInstrument() {
            const ac = new AudioContext()
            const soundfontInstrument = normalizeInstrumentName(instrument, soundfont)
            Soundfont.instrument(ac, soundfontInstrument, { soundfont, notes })
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
            ac.close()
        }
    }, [instrument, isMute, soundfont])

    useEffect(() => {
        const notes = activeKeys.filter((note) => note.channel === channel)
        if (isMute || !notes.length || !instrumentPlayer) return

        let newNotes = notes

        if (prevActiveKeys) {
            newNotes = notes.filter(
                (note) =>
                    !(prevActiveKeys as ActiveNote[]).find(
                        (prevActiveKey) =>
                            'id' in prevActiveKey && 'id' in note && prevActiveKey.id === note.id
                    )
            )
        }

        newNotes.forEach((note) => {
            playNote(note, instrumentPlayer)
        })
    }, [activeKeys, instrumentPlayer, isMute])

    return null
}
