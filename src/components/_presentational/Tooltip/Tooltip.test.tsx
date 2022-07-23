import { render, screen } from '@testing-library/react'
import React from 'react'
import { Tooltip } from './Tooltip'
import userEvent from '@testing-library/user-event'

const onShow = jest.fn()
const onHide = jest.fn()

describe('Tooltip', () => {
    describe('When the "show" prop is "false"', () => {
        it('should not display the content', () => {
            render(
                <Tooltip show={false}>
                    <span>Click me</span>
                    <span>I am the content</span>
                </Tooltip>
            )

            expect(screen.queryByText('I am the content')).not.toBeInTheDocument()
        })
    })

    describe('When the "show" prop is "true"', () => {
        it('should display the content', async () => {
            render(
                <Tooltip show>
                    <span>Click me</span>
                    <span>I am the content</span>
                </Tooltip>
            )
            await screen.findByText('I am the content')
        })
    })

    describe('When the "showOnHover" prop is "true"', () => {
        it('should show the content on mouseEnter', () => {
            render(
                <Tooltip showOnHover onShow={onShow} onHide={onHide}>
                    <span>Hover me</span>
                    <span>I am the content</span>
                </Tooltip>
            )
            const reference = screen.getByText('Hover me')
            userEvent.hover(reference)
            expect(onShow).toHaveBeenCalled()
            expect(screen.getByText('I am the content')).toBeInTheDocument()
            userEvent.unhover(reference)
            expect(onHide).toHaveBeenCalled()
            expect(screen.queryByText('I am the content')).not.toBeInTheDocument()
        })

        it('should hide the content on mouseLeave', () => {
            render(
                <Tooltip showOnHover onShow={onShow} onHide={onHide}>
                    <span>Hover me</span>
                    <span>I am the content</span>
                </Tooltip>
            )
            const reference = screen.getByText('Hover me')
            userEvent.hover(reference)
            userEvent.unhover(reference)
            expect(onHide).toHaveBeenCalled()
            expect(screen.queryByText('I am the content')).not.toBeInTheDocument()
        })
    })
})
