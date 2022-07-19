import React from 'react'
import { render, screen } from '@testing-library/react'
import { usePrevious } from './usePrevious'

interface MyComponentProps {
    myProp: string
}

function MyComponent({ myProp }: MyComponentProps) {
    const previousValue = usePrevious(myProp)
    return <div>{previousValue}</div>
}

describe('usePrevious', () => {
    it('on first render should return the current value', () => {
        render(<MyComponent myProp={'hello'} />)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('on second render should return the previous value', () => {
        const { rerender } = render(<MyComponent myProp={'hello'} />)

        rerender(<MyComponent myProp={'very nice to meet you'} />)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })
})
