import { render, screen } from '@testing-library/react'
import React from 'react'
import { Tooltip } from './Tooltip'
import userEvent from '@testing-library/user-event'

describe('Tooltip', () => {
    it('should not display the content when the show prop is false', () => {
        render(
            <Tooltip show={false}>
                <span>Click me</span>
                <span>I am the content</span>
            </Tooltip>
        )

        expect(screen.queryByText('I am the content')).not.toBeInTheDocument()
    })
    it('should display the content when the show prop is true', () => {
        render(
            <Tooltip show>
                <span>Click me</span>
                <span>I am the content</span>
            </Tooltip>
        )
        expect(screen.getByText('I am the content')).toBeInTheDocument()
    })
    it('should display the content on hover', () => {
        const onShow = jest.fn()
        const onHide = jest.fn()
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
})
