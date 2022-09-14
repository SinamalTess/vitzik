import { render, screen } from '@testing-library/react'
import App from '../App'
import {
    clickAutoplaySwitch,
    clickMidiExample,
    clickPause,
    clickPlay,
    clickStop,
    clickVolume,
    pressKey,
} from './utils'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'
import { waitSoundFontInstrumentPromise } from './utils/acts'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The audio player', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should render', async () => {
        render(<App />)

        await clickMidiExample()
        await waitSoundFontInstrumentPromise()

        expect(screen.getAllByText('Turkish March - Mozart')[0]).toBeInTheDocument()
        expect(screen.getByText('03:18')).toBeInTheDocument()
        expect(screen.getByLabelText('volume')).toBeInTheDocument()
        expect(screen.getByLabelText('stop')).toBeInTheDocument()
        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })
    it('should play when the play button is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('play')).toBeInTheDocument()
    })
    it('should mute and unmute when the autoplay switch is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickAutoplaySwitch()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('muted')).toBeInTheDocument()

        await clickAutoplaySwitch()

        expect(screen.queryByLabelText('muted')).not.toBeInTheDocument()
    })
    it('should mute and unmute when the (m) shortcut is used', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('{m}')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('muted')).toBeInTheDocument()

        await pressKey('{m}')

        expect(screen.queryByLabelText('muted')).not.toBeInTheDocument()
    })
    it('should enter and exit loop mode when the (l) shortcut is used', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('{l}')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByTestId('loop-editor')).toBeInTheDocument()

        await pressKey('{l}')

        expect(screen.queryByTestId('loop-editor')).not.toBeInTheDocument()
    })
    it('should stop when the stop button is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await clickStop()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })
    it('should pause when the paused button is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await clickPause()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })
    it('should mute and unmute when the volume button is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickVolume()
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('muted')).toBeInTheDocument()

        await clickVolume()

        expect(screen.getByLabelText('volume')).toBeInTheDocument()
    })
    it('should play when the space bar is pressed', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('[space]')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('play')).toBeInTheDocument()
    })
    it('should pause when the space bar is pressed while the player was playing', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('[space]')
        await pressKey('[space]')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })
    it('should resume playing when the space bar is pressed while the player was paused', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('[space]')
        await pressKey('[space]')
        await pressKey('[space]')
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('play')).toBeInTheDocument()
    })
})
