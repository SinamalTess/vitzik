import { mockIntervalWorker } from '../mocks/AppContextProviderMock'

export const dispatchWorkerTimeEvent = (newTime: number) => {
    console.log('hello')
    mockIntervalWorker.callWith('', { time: newTime })
}
