import React, { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { useClickOutside } from './useClickOutside'
import userEvent from '@testing-library/user-event'

interface MyComponentProps {
    listenToOutsideClicks: boolean
}

const clickInside = () => {
    const button = screen.getByTestId(/inside/)
    userEvent.click(button)
}

const clickOutside = () => {
    const button = screen.getByTestId(/outside/)
    userEvent.click(button)
}

const onClickOutside = jest.fn()

function MyComponent({ listenToOutsideClicks }: MyComponentProps) {
    const ref = useRef(null)

    useClickOutside([ref], onClickOutside, listenToOutsideClicks)

    return (
        <div data-testid={'outside-container'}>
            <div ref={ref} data-testid={'inside-container'}>
                My component is awesome
            </div>
        </div>
    )
}

describe('useClickOutside()', () => {
    describe('When the condition is "true"', () => {
        it('should listen to outside clicks', () => {
            render(<MyComponent listenToOutsideClicks />)
            clickOutside()

            expect(onClickOutside).toHaveBeenCalled()
        })
        it('should not listen to inside clicks', () => {
            render(<MyComponent listenToOutsideClicks />)
            clickInside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
    })
    describe('When the condition is "false"', () => {
        it('should not listen to outside clicks', () => {
            render(<MyComponent listenToOutsideClicks={false} />)
            clickOutside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
        it('should not listen to inside clicks', () => {
            render(<MyComponent listenToOutsideClicks={false} />)
            clickInside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
    })
})
