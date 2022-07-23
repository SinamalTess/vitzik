import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { WorkerMock } from '../../tests/mocks/worker'
import { AudioPlayerState } from '../../types'
import { act } from 'react-dom/test-utils'
import {
    clickPause,
    clickPlay,
    clickProgressBarAt,
    clickStop,
    pressArrowDown,
    pressArrowUp,
    pressSpace,
} from '../../tests/utils'

const worker = new WorkerMock('')

const mockWorkerTimeEvent = (newTime: number) => {
    const callbacks = worker.callback
    callbacks.forEach((callback) =>
        callback({
            data: {
                time: newTime,
            },
        })
    )
}

const props = {
    state: 'stopped' as AudioPlayerState,
    worker: worker as Worker,
    title: 'My song',
    duration: 1000,
    onMute: () => {},
    onChangeState: () => {},
}

describe('AudioPlayer', () => {
    const onChangeState = jest.fn()
    it('should render the player', () => {
        render(<AudioPlayer {...props}></AudioPlayer>)

        expect(screen.getByText('My song')).toBeInTheDocument()
        expect(screen.getByText('00:01')).toBeInTheDocument()
        expect(screen.getByLabelText('volume')).toBeInTheDocument()
        expect(screen.getByLabelText('stop')).toBeInTheDocument()
        expect(screen.getByLabelText('paused')).toBeInTheDocument()
    })

    describe('controls', () => {
        it('should play when the play button is clicked', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            clickPlay()

            expect(onChangeState).toHaveBeenCalledWith('playing')
        })
        it('should stop when the stop button is clicked', () => {
            render(
                <AudioPlayer
                    {...props}
                    state={'playing'}
                    onChangeState={onChangeState}
                ></AudioPlayer>
            )
            clickStop()

            expect(onChangeState).toHaveBeenCalledWith('stopped')
        })

        it('should pause when the paused button is clicked', () => {
            render(
                <AudioPlayer
                    {...props}
                    state={'playing'}
                    onChangeState={onChangeState}
                ></AudioPlayer>
            )
            mockWorkerTimeEvent(500)
            clickPause()

            expect(onChangeState).toHaveBeenCalledWith('paused')
        })
    })

    it('should stop when the end of the song is reached', () => {
        render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
        mockWorkerTimeEvent(1200)

        expect(onChangeState).toHaveBeenCalledWith('stopped')
    })

    it('should stop playing if the end of a loop is reached and restore the previous player state', async () => {
        render(
            <AudioPlayer
                {...props}
                state={'playing'}
                loopTimes={[200, 500]}
                onChangeState={onChangeState}
            ></AudioPlayer>
        )

        await act(async () => {
            mockWorkerTimeEvent(600)
        })

        expect(onChangeState).toHaveBeenCalledWith('seeking')
        await waitFor(() => {
            expect(onChangeState).toHaveBeenCalledWith('playing')
        })
    })

    describe('shortcuts', () => {
        it('should change the state then the space bar is pressed', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            pressSpace()
            expect(onChangeState).toHaveBeenCalledTimes(1)
        })

        it('should change the state then arrowUp key is pressed', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            pressArrowUp()
            expect(onChangeState).toHaveBeenCalledWith('seeking')
            expect(onChangeState).toHaveBeenCalledWith('paused')
            expect(onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state then arrowDown key is pressed', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            pressArrowDown()
            expect(onChangeState).toHaveBeenCalledWith('seeking')
            expect(onChangeState).toHaveBeenCalledWith('paused')
            expect(onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state when the progressbar is clicked', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            clickProgressBarAt(100)
            expect(onChangeState).toHaveBeenCalledWith('seeking')
            expect(onChangeState).toHaveBeenCalledWith('paused')
            expect(onChangeState).toHaveBeenCalledTimes(2)
        })
    })
})
