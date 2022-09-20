// @ts-ignore
import { mockIntervalWorker } from '../../setupTests.js'

export const dispatchIntervalWorkerEvent = (time: number) => {
    mockIntervalWorker.callWith('updateTimer', { time })
}
