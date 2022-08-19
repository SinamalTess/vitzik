import React from 'react'
import { render, screen } from '@testing-library/react'
import { Tooltip } from './Tooltip'
import userEvent from '@testing-library/user-event'

const onShow = jest.fn()
const onHide = jest.fn()

describe('Tooltip', () => {
    it('should show an error when no children are passed', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})
        // @ts-ignore (no children is intended for the test)
        render(<Tooltip></Tooltip>)

        expect(consoleMock).toBeCalledWith('<Tooltip> was not passed any children')
    })
    it('should show an error when the children are not an array', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <Tooltip>
                <span>Hello</span>
            </Tooltip>
        )

        expect(consoleMock).toBeCalledWith('<Tooltip> expected an array of children')
    })
    describe('When the "show" prop is "false"', () => {
        it('should not display the tooltip', () => {
            render(
                <Tooltip show={false}>
                    <span>Click me</span>
                    <span>I am the tooltip</span>
                </Tooltip>
            )

            expect(screen.queryByText('I am the tooltip')).not.toBeInTheDocument()
        })
    })

    describe('When the "show" prop is "true"', () => {
        it('should display the tooltip', async () => {
            render(
                <Tooltip show>
                    <span>Click me</span>
                    <span>I am the tooltip</span>
                </Tooltip>
            )
            await screen.findByText('I am the tooltip')
        })
    })

    describe('When the "showOnHover" prop is "true"', () => {
        it('should show the tooltip on mouseEnter', async () => {
            render(
                <Tooltip showOnHover onShow={onShow} onHide={onHide}>
                    <span>Hover me</span>
                    <span>I am the tooltip</span>
                </Tooltip>
            )

            const reference = screen.getByText('Hover me')
            await userEvent.hover(reference)

            expect(onShow).toHaveBeenCalled()
            expect(screen.getByText('I am the tooltip')).toBeInTheDocument()

            await userEvent.unhover(reference)

            expect(onHide).toHaveBeenCalled()
            expect(screen.queryByText('I am the tooltip')).not.toBeInTheDocument()
        })

        it('should hide the tooltip on mouseLeave', async () => {
            render(
                <Tooltip showOnHover onShow={onShow} onHide={onHide}>
                    <span>Hover me</span>
                    <span>I am the tooltip</span>
                </Tooltip>
            )

            const reference = screen.getByText('Hover me')
            await userEvent.hover(reference)
            await userEvent.unhover(reference)

            expect(onHide).toHaveBeenCalled()
            expect(screen.queryByText('I am the tooltip')).not.toBeInTheDocument()
        })
    })
})
