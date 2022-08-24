import React from 'react'
import { IAppContext } from '../../components/_contexts'
import { IntervalWorkerMessengerMock } from './IntervalWorkerMessengerMock'

export const mockIntervalWorker = new IntervalWorkerMessengerMock()

export const AppContext = React.createContext<IAppContext>({
    intervalWorker: null,
    keyboardShortcuts: [],
    setKeyboardShortcuts: () => {},
})

export const AppContextProviderMock = ({ children }: { children: any }) => {
    const [keyboardShortcuts, setKeyboardShortcuts] = React.useState<string[]>([])

    const appContextValue = {
        intervalWorker: mockIntervalWorker,
        setKeyboardShortcuts,
        keyboardShortcuts,
    }

    // @ts-ignore
    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}
