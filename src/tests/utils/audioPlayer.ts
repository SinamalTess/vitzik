import { screen } from '@testing-library/react'
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
    const button = screen.getByLabelText('volume')
    userEvent.click(button)
}

export const pressSpace = () => {
    userEvent.keyboard('{space}')
}

export const pressArrowUp = () => {
    userEvent.keyboard('{arrowup}')
}

export const pressArrowDown = () => {
    userEvent.keyboard('{arrowdown}')
}
