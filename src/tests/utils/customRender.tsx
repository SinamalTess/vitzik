import React, { ReactNode, useContext, useState } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppContext } from '../../components/_contexts'
import { ShortcutsContext } from '../../components/_contexts/ShortcutsContext'
import { WebWorker } from '../../workers/WebWorker'
import { IntervalWorkerMock } from '../mocks/intervalWorker'

interface AppContextProviderPropsMock {
    children: ReactNode
}

const worker = new IntervalWorkerMock('')
export const intervalWorker = WebWorker(worker) as IntervalWorkerMock

const AppContextProviderMock = ({ children }: AppContextProviderPropsMock) => {
    const { shortcuts: shortcutsDefault } = useContext(ShortcutsContext)
    const [shortcuts, setShortcuts] = useState<string[]>(shortcutsDefault)
    const worker = intervalWorker as Worker
    const appContextValue = { intervalWorker: worker, setShortcuts, shortcuts }

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
    render(ui, { wrapper: AppContextProviderMock, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
