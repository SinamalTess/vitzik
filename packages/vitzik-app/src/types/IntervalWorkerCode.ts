export type IntervalWorkerCode = 'start' | 'updateTimer' | 'stop' | 'pause' | 'restart' | 'getTime'

export interface IntervalWorkerMessage {
    code: IntervalWorkerCode
    startAt?: number
    midiSpeedFactor?: number
}
