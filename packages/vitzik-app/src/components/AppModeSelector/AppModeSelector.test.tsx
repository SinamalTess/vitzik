import { render, screen } from '@testing-library/react'
import React from 'react'
import { AppModeSelector } from './index'
import { clickImportMode } from '../../tests/utils'

describe('AppModeSelector', () => {
    const onChange = vi.fn()

    it('should show a disabled "learning" button', async () => {
        render(<AppModeSelector appMode={'import'} onChange={onChange}></AppModeSelector>)

        const button = screen.getByText(/theory/i)

        expect(button).toBeDisabled()
    })

    it('should call onChange() callback with "import" mode', async () => {
        render(<AppModeSelector appMode={'theory'} onChange={onChange}></AppModeSelector>)

        await clickImportMode()

        expect(onChange).toHaveBeenCalledWith('import')
    })
})
