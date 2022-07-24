import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { WorkerMock } from '../../tests/mocks/worker'
import { AudioPlayerState } from '../../types'
import { act } from 'react-dom/test-utils'
import { clickProgressBarAt, pressKey } from '../../tests/utils'
import { dispatchWorkerTimeEvent } from '../../tests/utils/intervalWorkerEvent'

const worker = new WorkerMock('')

const props = {
    state: 'stopped' as AudioPlayerState,
    worker: worker as Worker,
    title: 'My song',
    duration: 1000,
    onMute: () => {},
    onChangeState: () => {},
    onToggleSound: () => {},
}

describe('AudioPlayer', () => {
    const onChangeState = jest.fn()

    it('should stop when the end of the song is reached', () => {
        render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
        dispatchWorkerTimeEvent(worker, 1200)

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
            dispatchWorkerTimeEvent(worker, 600)
        })

        expect(onChangeState).toHaveBeenCalledWith('seeking')
        await waitFor(() => {
            expect(onChangeState).toHaveBeenCalledWith('playing')
        })
    })

    describe('shortcuts', () => {
        it('should change the state then arrowUp key is pressed', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            pressKey('{arrowup}')
            expect(onChangeState).toHaveBeenCalledWith('seeking')
            expect(onChangeState).toHaveBeenCalledWith('paused')
            expect(onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state then arrowDown key is pressed', () => {
            render(<AudioPlayer {...props} onChangeState={onChangeState}></AudioPlayer>)
            pressKey('{arrowdown}')
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
