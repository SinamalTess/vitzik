import React from 'react'
import { IntervalWorkerMessenger } from './IntervalWorkerMessenger'

export interface IIntervalWorkerContext {
    intervalWorker: IntervalWorkerMessenger | null
}

export const IntervalWorkerContext = React.createContext<IIntervalWorkerContext>({
    intervalWorker: new IntervalWorkerMessenger(),
})
