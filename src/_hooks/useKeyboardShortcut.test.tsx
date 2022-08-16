import React, { useContext } from 'react'
import { useKeyboardShortcut } from './useKeyboardShortcut'
import { render, screen } from '@testing-library/react'
import { ShortcutsContext } from '../components/ShortcutsContext'
import { ShortcutsContextProvider } from '../components/ShortcutsContext/ShortcutsContext'

function MyComponent() {
    const { shortcuts, setShortcuts } = useContext(ShortcutsContext)
    const code = 'ArrowUp'
    const onKeyDown = jest.fn()
    const onKeyUp = jest.fn()

    useKeyboardShortcut(code, onKeyDown, onKeyUp)

    return <div>Registered shortcuts: {shortcuts}</div>
}

describe('useKeyboardShortcut()', () => {
    describe('When the component initializes', () => {
        it('should register the shortcut in the context', async () => {
            render(
                <ShortcutsContextProvider>
                    <MyComponent />
                </ShortcutsContextProvider>
            )
            expect(screen.getByText(/ArrowUp/)).toBeVisible()
        })
    })
})
