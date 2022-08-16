import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { IntervalWorkerMock } from '../../tests/mocks/intervalWorker'
import { AudioPlayerState } from '../../types'
import { act } from 'react-dom/test-utils'
import { clickProgressBarAt, pressKey } from '../../tests/utils'
import { dispatchWorkerTimeEvent } from '../../tests/utils/intervalWorkerEvent'
import { ShortcutsContextProvider } from '../ShortcutsContext/ShortcutsContext'

const worker = new IntervalWorkerMock('')

const props = {
    playerState: 'stopped' as AudioPlayerState,
    intervalWorker: worker as Worker,
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
    it('should stop when the end of the song is reached', () => {
        render(<AudioPlayer {...props}></AudioPlayer>)

        dispatchWorkerTimeEvent(worker, 1200)

        expect(props.onChangeState).toHaveBeenCalledWith('stopped')
    })

    it('should stop playing if the end of a loop is reached and restore the previous player state', async () => {
        render(
            <AudioPlayer {...props} playerState={'playing'} loopTimes={[200, 500]}></AudioPlayer>
        )

        await act(async () => {
            dispatchWorkerTimeEvent(worker, 600)
        })

        expect(props.onChangeState).toHaveBeenCalledWith('seeking')
        await waitFor(() => {
            expect(props.onChangeState).toHaveBeenCalledWith('playing')
        })
    })

    describe('shortcuts', () => {
        it('should change the state when arrowUp key is pressed', async () => {
            render(
                <ShortcutsContextProvider>
                    <AudioPlayer {...props}></AudioPlayer>
                </ShortcutsContextProvider>
            )

            await pressKey('{arrowup}')

            expect(props.onChangeState).toHaveBeenCalledWith('seeking')
            expect(props.onChangeState).toHaveBeenCalledWith('paused')
            expect(props.onChangeState).toHaveBeenCalledTimes(2)
        })

        it('should change the state when arrowDown key is pressed', async () => {
            render(
                <ShortcutsContextProvider>
                    <AudioPlayer {...props}></AudioPlayer>
                </ShortcutsContextProvider>
            )

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
