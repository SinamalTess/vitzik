import { screen, render } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import userEvent from '@testing-library/user-event'

class Worker {
    private url: string
    private onmessage: () => void
    private terminate: () => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.terminate = () => {}
    }

    postMessage() {
        this.onmessage()
    }
}

describe('AudioPlayer', () => {
    // @ts-ignore
    window.Worker = Worker
    window.URL.createObjectURL = jest.fn()

    it('returns the proper audio player state', () => {
        const props = {
            midiTrackCurrentTime: 0,
            midiTrackDuration: 100,
            isMute: true,
            onToggleSound: () => {},
            onChangeAudioPlayerState: jest.fn(),
            onChangeMidiTrackCurrentTime: () => {},
        }

        const { rerender } = render(<AudioPlayer {...props}></AudioPlayer>)
        const { onChangeAudioPlayerState } = props

        expect(onChangeAudioPlayerState).toHaveBeenCalledWith('stopped')

        rerender(<AudioPlayer {...props} midiTrackCurrentTime={20}></AudioPlayer>)

        expect(onChangeAudioPlayerState).toHaveBeenCalledWith('seeking')

        rerender(<AudioPlayer {...props} midiTrackCurrentTime={5}></AudioPlayer>)

        expect(onChangeAudioPlayerState).toHaveBeenCalledWith('rewinding')

        const playButton = screen.getByText('Play')
        userEvent.click(playButton)

        expect(onChangeAudioPlayerState).toHaveBeenCalledWith('playing')

        const pauseButton = screen.getByText('Pause')
        userEvent.click(pauseButton)

        expect(onChangeAudioPlayerState).toHaveBeenCalledWith('paused')
    })
})
