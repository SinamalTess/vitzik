import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import {
    clickAutoplaySwitch,
    clickMidiExample,
    clickPause,
    clickPlay,
    clickProgressBarAt,
    clickStop,
    clickVolume,
    pressKey,
} from './utils'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'
import { waitSoundFontInstrumentPromise } from './utils/acts'
import { dispatchIntervalWorkerEvent } from './utils/intervalWorker'

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
        expect(screen.getByText('00:00')).toBeInTheDocument()
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
    it('should seek forward when the (ArrowUp) keyboard shortcut is used', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('{ArrowUp}', 10)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByText('00:01')).toBeInTheDocument()
    })
    it("should'nt seek backward when the (ArrowDown) keyboard shortcut is used at the beginning of the song", async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('{ArrowDown}', 10)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByText('00:00')).toBeInTheDocument()
    })
    it('should seek backward when the (ArrowDown) keyboard shortcut is used during the song', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('{ArrowUp}', 10)
        await pressKey('{ArrowDown}', 10)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByText('00:00')).toBeInTheDocument()
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
        await pressKey('[space]', 2)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })
    it('should resume playing when the space bar is pressed while the player was paused', async () => {
        render(<App />)

        await clickMidiExample()
        await pressKey('[space]', 3)
        await waitSoundFontInstrumentPromise()

        expect(screen.getByLabelText('play')).toBeInTheDocument()
    })

    it('should stop when the end of the song is reached', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await waitSoundFontInstrumentPromise()
        dispatchIntervalWorkerEvent(200000)

        await waitFor(() => {
            expect(screen.getByLabelText('paused')).toBeInTheDocument()
        })
    })

    it('should change the time when the progress bar is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickProgressBarAt(39000)

        const timers = screen.getAllByRole('timer')
        await waitFor(() => {
            expect(timers[0]).toHaveTextContent('00:39')
        })
    })

    it('should revert to the previous player state when the progress bar is clicked', async () => {
        render(<App />)

        await clickMidiExample()
        await clickPlay()
        await clickProgressBarAt(39000)

        expect(screen.getByLabelText('play')).toBeInTheDocument()
    })
})
