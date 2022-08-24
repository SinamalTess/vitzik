import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { mockIntervalWorker, AppContextProviderMock } from '../mocks/AppContextProviderMock'

jest.mock('../../components/_contexts/IntervalWorkerContext', () => {
    const React = require('React')
    return () => ({
        IntervalWorkerContext: React.createContext({
            intervalWorker: mockIntervalWorker,
        }),
    })
})

const renderWithContext = (ui: React.ReactElement, options?: RenderOptions) =>
    render(ui, { wrapper: AppContextProviderMock, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { renderWithContext as render }
