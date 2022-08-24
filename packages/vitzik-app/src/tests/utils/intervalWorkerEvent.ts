import { mockIntervalWorker } from '../mocks/AppContextProviderMock'

export const dispatchWorkerTimeEvent = (newTime: number) => {
    mockIntervalWorker.callWith('', 0, 0, newTime)
}
