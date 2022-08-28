import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickExtraSettings = async () => {
    const button = screen.getByLabelText(/settings/)
    await userEvent.click(button)
}

export const clickBpmButton = async () => {
    const button = screen.getByLabelText(/beats per minute/)
    await userEvent.click(button)
}

export const clickSpeedButton = async (newSpeedValue: number) => {
    const button = screen.getByText(`x${newSpeedValue}`)
    await userEvent.click(button)
}

export const clickSetLoopButton = async () => {
    const button = screen.getByLabelText(/loop/)
    await userEvent.click(button)
}

export const clickLoopEditorAt = (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    fireEvent.click(loopEditor, { clientX, clientY })
}

export const hoverLoopEditorAt = async (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    // @ts-ignore
    await userEvent.hover(loopEditor, { clientX, clientY })
}

export const clickAutoplaySwitch = async () => {
    const button = screen.getByLabelText(/autoplay/i)
    await userEvent.click(button)
}
