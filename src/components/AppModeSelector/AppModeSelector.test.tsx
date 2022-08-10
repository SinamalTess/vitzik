import { render } from '@testing-library/react'
import React from 'react'
import { AppModeSelector } from './'
import { clickImportMode, clickLearningMode } from '../../tests/utils'

jest.mock('../_presentational/Tooltip', () => ({
    Tooltip: ({ children }: any) => {
        return children
    },
}))

describe('AppModeSelector', () => {
    const onChange = jest.fn()

    xit('should call onChange() callback with "learning" mode', async () => {
        // for now the button is disabled
        render(<AppModeSelector appMode={'import'} onChange={onChange}></AppModeSelector>)
        await clickLearningMode()

        expect(onChange).toHaveBeenCalledWith('learning')
    })

    it('should call onChange() callback with "import" mode', async () => {
        render(<AppModeSelector appMode={'theory'} onChange={onChange}></AppModeSelector>)
        await clickImportMode()

        expect(onChange).toHaveBeenCalledWith('import')
    })
})
