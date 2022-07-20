import { render, screen } from '@testing-library/react'
import React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { Worker } from '../../tests/mocks/worker'
import userEvent from '@testing-library/user-event'

const worker = new Worker('')

const clickPlay = () => {
    const button = screen.getByLabelText(/paused button/)
    userEvent.click(button)
}

const clickStop = () => {
    const button = screen.getByLabelText(/stop button/)
    userEvent.click(button)
}

const clickPause = () => {
    const button = screen.getByLabelText(/paused button/)
    userEvent.click(button)
}

const mockWorkerTimeEvent = (newTime: number) => {
    worker.postMessage({
        time: newTime,
    })
}

describe('AudioPlayer', () => {
    it('should render the player', async () => {
        render(
            <AudioPlayer
                state={'stopped'}
                worker={worker}
                title={'My song'}
                duration={1000}
                onMute={() => {}}
                onChangeState={() => {}}
            ></AudioPlayer>
        )

        expect(screen.getByText('My song')).toBeInTheDocument()
        expect(screen.getByText('00:01')).toBeInTheDocument()
        expect(screen.getByLabelText(/volume button/)).toBeInTheDocument()
        expect(screen.getByLabelText(/stop button/)).toBeInTheDocument()
        expect(screen.getByLabelText(/paused button/)).toBeInTheDocument()
    })

    it('should call `onChangeState` prop with proper value when the play button is clicked', async () => {
        const onChangeState = jest.fn()
        render(
            <AudioPlayer
                state={'stopped'}
                worker={worker}
                title={'My song'}
                duration={1000}
                onMute={() => {}}
                onChangeState={onChangeState}
            ></AudioPlayer>
        )
        clickPlay()
        expect(onChangeState).toHaveBeenCalledWith('playing')
    })

    it('should listen to worker on render', async () => {
        const onChangeState = jest.fn()
        render(
            <AudioPlayer
                state={'stopped'}
                worker={worker}
                title={'My song'}
                duration={1000}
                onMute={() => {}}
                onChangeState={onChangeState}
            ></AudioPlayer>
        )
        expect(worker.addEventListener).toHaveBeenCalled()
    })

    it('should stop when the end of the song is reached', async () => {
        const onChangeState = jest.fn()
        render(
            <AudioPlayer
                state={'playing'}
                worker={worker}
                title={'My song'}
                duration={1000}
                onMute={() => {}}
                onChangeState={() => {}}
            ></AudioPlayer>
        )
        mockWorkerTimeEvent(1200) // exceeds the duration
        expect(onChangeState).toHaveBeenCalledWith('stopped')
    })
})
