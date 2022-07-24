import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickPlay = () => {
    const button = screen.getByLabelText('paused')
    userEvent.click(button)
}

export const clickStop = () => {
    const button = screen.getByLabelText('stop')
    userEvent.click(button)
}

export const clickPause = () => {
    const button = screen.getByLabelText('play')
    userEvent.click(button)
}

export const clickVolume = () => {
    const button = screen.queryByLabelText('volume')
    if (button) {
        userEvent.click(button)
    } else {
        const button = screen.queryByLabelText('muted')
        if (button) {
            userEvent.click(button)
        }
    }
}

export const pressKey = (key: string) => {
    userEvent.keyboard(key)
}

export const clickProgressBarAt = (value: number) => {
    const progressbar = screen.getByRole('slider')
    fireEvent.mouseDown(progressbar)
    fireEvent.mouseUp(progressbar, {
        target: {
            value,
        },
    })
}
