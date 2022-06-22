import { screen, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import userEvent from '@testing-library/user-event'

const terminate = jest.fn()

class Worker {
    private url: string
    onmessage: () => void
    terminate: () => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.terminate = terminate
    }

    postMessage() {
        this.onmessage()
    }
}

describe('AudioPlayer', () => {
    // @ts-ignore
    window.Worker = Worker
    window.URL.createObjectURL = jest.fn()

    const props = {
        midiCurrentTime: 0,
        midiDuration: 100,
        isMute: true,
        onToggleSound: () => {},
        onChangeAudioPlayerState: jest.fn(),
        onChangeMidiCurrentTime: () => {},
    }

    const { onChangeAudioPlayerState } = props

    describe(`State`, () => {
        it('should set the state to "stopped" when the cursor position is at 0', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('stopped')
        })

        it('should set the state to "seeking" when the user is moving the cursor forward', () => {
            const { rerender } = render(<AudioPlayer {...props}></AudioPlayer>)
            rerender(<AudioPlayer {...props} midiCurrentTime={20}></AudioPlayer>)

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('seeking')
        })

        it('should set the state to "rewinding" when the user is moving the cursor backward', () => {
            const { rerender } = render(<AudioPlayer {...props} midiCurrentTime={25}></AudioPlayer>)
            rerender(<AudioPlayer {...props} midiCurrentTime={5}></AudioPlayer>)

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('rewinding')
        })

        it('should set the state to "playing" when the Play button is clicked', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            clickPlay()

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('playing')
        })

        it('should set the state to "paused" when the Paused button is clicked', () => {
            render(<AudioPlayer {...props} midiCurrentTime={5}></AudioPlayer>)
            clickPlay()
            clickPause()

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('paused')
        })
    })

    describe('Worker', () => {
        it('should stop the worker when the user is moving the player cursor', () => {
            render(<AudioPlayer {...props} midiCurrentTime={5}></AudioPlayer>)
            const audioPlayer = screen.getByRole('slider')
            clickPlay()
            fireEvent.change(audioPlayer, { target: { value: 50 } })

            expect(terminate).toHaveBeenCalled()
        })
    })
})

const clickPlay = () => {
    const playButton = screen.getByText('Play')
    userEvent.click(playButton)
}

const clickPause = () => {
    const pauseButton = screen.getByText('Pause')
    userEvent.click(pauseButton)
}
