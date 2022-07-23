import { screen, render, act, waitFor } from '@testing-library/react'
import React, { ReactNode } from 'react'
import App from './App'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import {
    clickBPM,
    clickBPMValue,
    clickExtraSettings,
    clickLoop,
    clickPlay,
    clickVisualizationAt,
    clickVolume,
    pressSpace,
    selectInstrument,
} from './tests/utils'
import { dropValidFile } from './tests/utils/midiImporter'
import { clickKey } from './tests/utils/keyboard'

interface TooltipProps {
    children: ReactNode
}

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

jest.mock('./components/MidiImporter', () => {
    const midiJson = require('./tests/midi1.json')

    return {
        MidiImporter: ({ onMidiImport }: any) => {
            return <div onDrop={() => onMidiImport('My song', midiJson)}> dropzone </div>
        },
    }
})

jest.mock('./components/_presentational/Tooltip', () => ({
    Tooltip: ({ children }: TooltipProps) => {
        return children
    },
}))

jest.mock('midi-json-parser', () => () => {})

jest.mock('./components/_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component: any) => (props: any) => {
        return <Component {...props} height={100} width={200} />
    },
}))

const checkPromise = async () => {
    await act(async () => {
        await Soundfont.instrument
    })
}

describe('App', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue({
            inputs: {
                values: () => [],
            },
            outputs: {
                values: () => [],
            },
        })

        // @ts-ignore
        Soundfont.instrument.mockResolvedValue('fakeInstrumentPlayer')
    })

    it('should render', async () => {
        render(<App />)
        expect(screen.getByText('Import Midi')).toBeInTheDocument()
        expect(screen.getByText(/Music theory/i)).toBeInTheDocument()
        await checkPromise()
    })

    it('should let extra settings be opened', async () => {
        render(<App />)

        clickExtraSettings()
        expect(screen.getByText(/User Instrument/i)).toBeVisible()
        expect(screen.getByAltText(/Acoustic Grand Keyboard/i)).toBeVisible()
        await checkPromise()
    })

    it('should show audio player on midi upload', async () => {
        render(<App />)
        dropValidFile()
        expect(screen.getByText('02:33')).toBeInTheDocument()
        expect(screen.getByLabelText('volume')).toBeInTheDocument()
        expect(screen.getByLabelText('stop')).toBeInTheDocument()
        expect(screen.getByLabelText('paused')).toBeInTheDocument()
        await checkPromise()
    })

    it('should play when the space bar is pressed', async () => {
        render(<App />)
        dropValidFile()
        pressSpace()
        expect(screen.getByLabelText('play')).toBeInTheDocument()
        await checkPromise()
    })

    it('should mute when the volume button is clicked', async () => {
        render(<App />)
        dropValidFile()
        clickVolume()
        expect(screen.getByLabelText('muted')).toBeInTheDocument()
        await checkPromise()
    })

    it('should show the first BPM value', async () => {
        render(<App />)
        dropValidFile()
        expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
        expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent('78')
        await checkPromise()
    })

    it('should let the BPM value be changed', async () => {
        const initialBPM = 78
        const speedValue = 2
        const expectedBPM = initialBPM * speedValue
        render(<App />)
        dropValidFile()
        clickBPM()
        clickBPMValue(speedValue)
        expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
        expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent(expectedBPM.toString())
        await checkPromise()
    })

    it('should show a track list in the extra settings', async () => {
        render(<App />)
        dropValidFile()
        clickExtraSettings()

        expect(screen.getByText(/User Instrument/i)).toBeVisible()
        expect(screen.getByAltText(/Acoustic Grand Keyboard/i)).toBeVisible()
        expect(screen.getByText(/hide all/i)).toBeVisible()
        expect(screen.getByAltText(/Bright Acoustic Keyboard/i)).toBeVisible() // instrument
        expect(screen.getByText('Piano')).toBeVisible() // track name
        await checkPromise()
    })

    it('should let the user instrument be changed in the extra settings', async () => {
        render(<App />)
        dropValidFile()
        clickExtraSettings()
        selectInstrument('Ocarina')
        expect(screen.getByTestId('instrument-selector')).toHaveTextContent('Ocarina')
        expect(screen.getByText(/User Instrument/i)).toBeVisible()
        expect(screen.getByAltText(/Bright Acoustic Keyboard/i)).toBeVisible() // instrument
        expect(screen.getByText('Piano')).toBeVisible() // track name
        await checkPromise()
    })

    it('should allow the user to set times for the loop', async () => {
        render(<App />)
        dropValidFile()
        clickPlay()
        clickLoop()
        clickVisualizationAt(50, 50)
        expect(screen.getByLabelText('loop-line')).toBeVisible()
        expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:01:800')
        await checkPromise()
    })
})
