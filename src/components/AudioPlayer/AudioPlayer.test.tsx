import { screen, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import userEvent from '@testing-library/user-event'
import { Worker, terminate } from '../../tests/mocks/worker'
import { MidiMode } from '../../types'

const clickPlay = () => {
    const playButton = screen.getByText('Play')
    userEvent.click(playButton)
}

const clickPause = () => {
    const pauseButton = screen.getByText('Pause')
    userEvent.click(pauseButton)
}

describe('AudioPlayer', () => {
    const midiMetas = {
        ticksPerBeat: 0,
        midiDuration: 100,
        instruments: [],
        format: 1,
        tracksMetas: [],
        allMsPerBeat: [],
    }
    const props = {
        midiMetas,
        midiSpeedFactor: 1,
        isMute: true,
        isPlaying: false,
        startingTime: 0,
        midiMode: 'autoplay' as MidiMode,
        timeToNextNote: 0,
        onToggleSound: () => {},
        onChangeAudioPlayerState: jest.fn(),
        onChangeMidiStartingTime: () => {},
        onChangeMidiSpeedFactor: () => {},
        onPlay: () => {},
    }

    const { onChangeAudioPlayerState } = props

    describe(`State`, () => {
        it('should set the state to "stopped" when the cursor position is at 0', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('stopped')
        })

        it('should set the state to "seeking" when the user is moving the cursor forward', () => {
            const { rerender } = render(<AudioPlayer {...props}></AudioPlayer>)
            rerender(<AudioPlayer {...props}></AudioPlayer>)

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('seeking')
        })

        it('should set the state to "rewinding" when the user is moving the cursor backward', () => {
            const { rerender } = render(<AudioPlayer {...props}></AudioPlayer>)
            rerender(<AudioPlayer {...props}></AudioPlayer>)

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('rewinding')
        })

        it('should set the state to "playing" when the Play button is clicked', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            clickPlay()

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('playing')
        })

        it('should set the state to "paused" when the Paused button is clicked', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            clickPlay()
            clickPause()

            expect(onChangeAudioPlayerState).toHaveBeenLastCalledWith('paused')
        })
    })

    describe('Worker', () => {
        it('should stop the worker when the user is moving the player cursor', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)
            const audioPlayer = screen.getByRole('slider')
            clickPlay()
            fireEvent.change(audioPlayer, { target: { value: 50 } })

            expect(terminate).toHaveBeenCalled()
        })
    })
})
