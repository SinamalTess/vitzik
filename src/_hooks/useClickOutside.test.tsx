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

describe('useClickOutside', () => {
    describe('If the condition is true', () => {
        it('should listen to outside clicks', () => {
            render(<MyComponent listenToOutsideClicks />)
            clickOutside()

            expect(onClickOutside).toHaveBeenCalled()
        })
        it('should not call the callback if the click is inside', () => {
            render(<MyComponent listenToOutsideClicks />)
            clickInside()

            expect(onClickOutside).toBeCalledTimes(0)
        })
    })
    describe('If the condition is false', () => {
        it('should not listen to outside clicks', () => {
            render(<MyComponent listenToOutsideClicks={false} />)
            clickOutside()

            expect(onClickOutside).toBeCalledTimes(0)
        })
        it('should not call the callback if the click is inside', () => {
            render(<MyComponent listenToOutsideClicks={false} />)
            clickInside()

            expect(onClickOutside).toBeCalledTimes(0)
        })
    })
})
