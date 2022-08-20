import React, { useContext } from 'react'
import { useKeyboardShortcut } from './useKeyboardShortcut'
import { render, screen } from '../tests/utils/customRender'
import { AppContext } from '../components/_contexts'

function MyComponent() {
    const { shortcuts, setShortcuts } = useContext(AppContext)
    const code = 'ArrowUp'
    const onKeyDown = jest.fn()
    const onKeyUp = jest.fn()

    useKeyboardShortcut(code, onKeyDown, onKeyUp)

    return <div>Registered shortcuts: {shortcuts}</div>
}

describe('useKeyboardShortcut()', () => {
    describe('When the component initializes', () => {
        it('should register the shortcut in the context', async () => {
            render(<MyComponent />)

            expect(screen.getByText(/ArrowUp/)).toBeVisible()
        })
    })
})