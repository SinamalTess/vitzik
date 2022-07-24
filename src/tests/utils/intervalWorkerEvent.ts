import { WorkerMock } from '../mocks/worker'

export const dispatchWorkerTimeEvent = (worker: WorkerMock, newTime: number) => {
    const callbacks = worker.callback
    callbacks.forEach((callback) =>
        callback({
            data: {
                time: newTime,
            },
        })
    )
}
