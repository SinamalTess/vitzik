import { IntervalWorkerMock } from '../mocks/intervalWorker'

export const dispatchWorkerTimeEvent = (worker: IntervalWorkerMock, newTime: number) => {
    const callbacks = worker.callbacks
    callbacks.forEach((callback) =>
        callback({
            data: {
                time: newTime,
            },
        })
    )
}
