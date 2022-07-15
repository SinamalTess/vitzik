import { screen, render } from '@testing-library/react'
import React from 'react'
import { ModeSelector } from './'
import userEvent from '@testing-library/user-event'

jest.mock('../_presentational/Tooltip', () => ({
    Tooltip: ({ children }: any) => {
        return children
    },
}))

const clickLearningMode = () => {
    const button = screen.getByText(/music theory/i)
    userEvent.click(button)
}

const clickImportMode = () => {
    const button = screen.getByText(/import/i)
    userEvent.click(button)
}

describe('ModeSelector', () => {
    const onChange = jest.fn()

    xit('should call onChange() callback with "learning" mode', () => {
        // for now the button is disabled
        render(<ModeSelector appMode={'import'} onChange={onChange}></ModeSelector>)
        clickLearningMode()

        expect(onChange).toHaveBeenCalledWith('learning')
    })

    it('should call onChange() callback with "import" mode', () => {
        render(<ModeSelector appMode={'learning'} onChange={onChange}></ModeSelector>)
        clickImportMode()

        expect(onChange).toHaveBeenCalledWith('import')
    })
})
