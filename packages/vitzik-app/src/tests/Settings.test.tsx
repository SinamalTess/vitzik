import { render, screen } from '@testing-library/react'
import App from '../App'
import {
    clickBpmButton,
    clickLoopEditorAt,
    clickMidiExample,
    clickPlay,
    clickSetLoopButton,
    clickSpeedButton,
    hoverLoopEditorAt,
} from './utils'
import { waitSoundFontInstrumentPromise } from './utils/acts'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The settings', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should show the first bpm value', async () => {
        render(<App />)

        await clickMidiExample()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
        expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent('135')
    })
    it('should let the bpm value be changed', async () => {
        const initialBpm = 135
        const speedValue = 2
        const expectedBpm = initialBpm * speedValue
        render(<App />)

        await clickMidiExample()
        await clickBpmButton()
        await clickSpeedButton(speedValue)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
        expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent(expectedBpm.toString())
    })
    it('should allow the user to set times for the loop', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await clickSetLoopButton()
        clickLoopEditorAt(50, 50)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('loop-line')).toBeVisible()
        expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:01:800')
    })
    it('should show a preview loop line on hover', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await clickSetLoopButton()
        await hoverLoopEditorAt(50, 50)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('loop-line')).toBeVisible()
        expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:02:800')
    })
})
