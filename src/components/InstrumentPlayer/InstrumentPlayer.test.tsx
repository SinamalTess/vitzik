import { render } from '@testing-library/react'
import React from 'react'
import { InstrumentPlayer } from './InstrumentPlayer'
import * as midiFile from '../../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiVisualizerActiveNote } from '../../types'
import Soundfont from 'soundfont-player'
import Mock = jest.Mock

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

describe('InstrumentPlayer', () => {
    const midiJson = midiFile as IMidiFile
    const activeNote: MidiVisualizerActiveNote = {
        name: 'A0',
        velocity: 100,
        id: '1',
        duration: 25,
        key: 21,
        channel: 0,
    }

    // @ts-ignore
    window.AudioContext = class AudioContext {
        close = () => new Promise(() => {})
    }

    it('should load the passed instrument', () => {
        ;(Soundfont.instrument as Mock).mockResolvedValueOnce('fakeInstrumentPlayer')

        render(
            <InstrumentPlayer
                midiFile={midiJson}
                activeKeys={[activeNote]}
                isMute={false}
                instrument={'Acoustic Grand Keyboard'}
                audioPlayerState={'playing'}
                channel={0}
            ></InstrumentPlayer>
        )

        expect(Soundfont.instrument).toHaveBeenCalledWith(
            expect.anything(),
            'acoustic_grand_piano',
            expect.anything()
        )
    })

    it('should load the passed soundfont', () => {
        ;(Soundfont.instrument as Mock).mockResolvedValueOnce('fakeInstrumentPlayer')

        render(
            <InstrumentPlayer
                midiFile={midiJson}
                activeKeys={[activeNote]}
                isMute={false}
                instrument={'Acoustic Grand Keyboard'}
                audioPlayerState={'playing'}
                soundfont={'FatBoy'}
                channel={0}
            ></InstrumentPlayer>
        )

        expect(Soundfont.instrument).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            soundfont: 'FatBoy',
        })
    })
})
