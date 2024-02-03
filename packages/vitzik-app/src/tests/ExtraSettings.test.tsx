import { render, screen } from '@testing-library/react'
import App from '../App'
import {
    changeUserInstrument,
    clickExtraSettings,
    clickMidiExample,
    clickShowNotesSwitch,
    dispatchMidiInputMessageEvent,
} from './utils'
import { waitRequestMIDIAccessPromise, waitSoundFontInstrumentPromise } from './utils/acts'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The extra settings', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        vi.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should show a track list', async () => {
        render(<App />)

        await clickMidiExample()
        await clickExtraSettings()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByText(/User Instrument/i)).toBeVisible()
        expect(screen.getAllByAltText(/Acoustic Grand Keyboard/i)).toHaveLength(3) // default instrument
        expect(screen.getByText(/hide all/i)).toBeVisible()
    })
    it('should let the user instrument be changed', async () => {
        render(<App />)

        await clickMidiExample()
        await clickExtraSettings()
        changeUserInstrument('Ocarina')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByTestId('instrument-selector')).toHaveTextContent('Ocarina')
        expect(screen.getByText(/User Instrument/i)).toBeVisible()
    })
    it('should hide the notes when the "show notes" switch is off', async () => {
        render(<App />)

        await clickMidiExample()
        await clickExtraSettings()
        await clickShowNotesSwitch()
        await waitSoundFontInstrumentPromise()
        await waitRequestMIDIAccessPromise()
        await dispatchMidiInputMessageEvent(midiInput, 'A0')

        expect(screen.queryByText('A0')).not.toBeInTheDocument()

        await clickExtraSettings()
        await clickShowNotesSwitch()

        expect(screen.getByText('A0')).toBeInTheDocument()
    })
})
