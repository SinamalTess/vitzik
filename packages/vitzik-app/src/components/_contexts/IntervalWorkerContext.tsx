import React from 'react'
import { WebWorker } from '../../workers/WebWorker'
// @ts-ignore
import intervalWorker from '../../workers/intervalWorker.js'

export interface IIntervalWorkerContext {
    intervalWorker: Worker | null
}

export const IntervalWorkerContext = React.createContext<IIntervalWorkerContext>({
    intervalWorker: WebWorker(intervalWorker),
})
