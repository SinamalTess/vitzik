import { mockIntervalWorker } from '../mocks/AppContextProviderMock'

export const dispatchWorkerTimeEvent = (newTime: number) => {
    mockIntervalWorker.callWith('', {time: newTime})
}
