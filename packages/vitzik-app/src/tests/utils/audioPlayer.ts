import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickPlay = async () => {
    const button = screen.getByLabelText('paused')
    await userEvent.click(button)
}

export const clickStop = async () => {
    const button = screen.getByLabelText('stop')
    await userEvent.click(button)
}

export const clickPause = async () => {
    const button = screen.getByLabelText('play')
    await userEvent.click(button)
}

export const clickVolume = async () => {
    const button = screen.queryByLabelText('volume')
    if (button) {
        await userEvent.click(button)
    } else {
        const button = screen.queryByLabelText('muted')
        if (button) {
            await userEvent.click(button)
        }
    }
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
