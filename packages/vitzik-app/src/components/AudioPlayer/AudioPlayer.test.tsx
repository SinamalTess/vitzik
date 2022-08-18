import { render, waitFor, intervalWorker } from '../../tests/utils/customRender'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { AudioPlayerState } from '../../types'
import { act } from 'react-dom/test-utils'
import { clickProgressBarAt, pressKey } from '../../tests/utils'
import { dispatchWorkerTimeEvent } from '../../tests/utils/intervalWorkerEvent'

const props = {
    playerState: 'stopped' as AudioPlayerState,
    title: 'My song',
    duration: 1000,
    onMute: jest.fn(),
    onChangeState: jest.fn(),
    onToggleSound: jest.fn(),
    midiMetas: {
        ticksPerBeat: 100,
        midiDuration: 1000,
        instruments: [],
        format: 1,
        tracksMetas: [],
        allMsPerBeat: [],
    },
}

describe('AudioPlayer', () => {
    it('should stop when the end of the song is reached', async () => {
        render(<AudioPlayer {...props}></AudioPlayer>)

        await act(async () => {
            dispatchWorkerTimeEvent(intervalWorker, 1200)
        })

        await waitFor(() => {
            expect(props.onChangeState).toHaveBeenCalledWith('stopped')
        })
    })

    it('should stop playing if the end of a loop is reached and restore the previous player state', async () => {
        render(
            <AudioPlayer {...props} playerState={'playing'} loopTimes={[200, 500]}></AudioPlayer>
        )

        await act(async () => {
            dispatchWorkerTimeEvent(intervalWorker, 600)
        })

        expect(props.onChangeState).toHaveBeenCalledWith('seeking')
        await waitFor(() => {
            expect(props.onChangeState).toHaveBeenCalledWith('playing')
        })
    })

    describe('shortcuts', () => {
        it('should change the state when arrowUp key is pressed', async () => {
            render(<AudioPlayer {...props}></AudioPlayer>)

            await pressKey('{arrowup}')

            expect(props.onChangeState).toHaveBeenCalledWith('seeking')
            expect(props.onChangeState).toHaveBeenCalledWith('paused')
            expect(props.onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state when arrowDown key is pressed', async () => {
            render(<AudioPlayer {...props}></AudioPlayer>)

            await pressKey('{arrowdown}')

            expect(props.onChangeState).toHaveBeenCalledWith('seeking')
            expect(props.onChangeState).toHaveBeenCalledWith('paused')
            expect(props.onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state when the progressbar is clicked', () => {
            render(<AudioPlayer {...props}></AudioPlayer>)

            clickProgressBarAt(100)

            expect(props.onChangeState).toHaveBeenCalledWith('seeking')
            expect(props.onChangeState).toHaveBeenCalledWith('paused')
            expect(props.onChangeState).toHaveBeenCalledTimes(2)
        })
    })
})
