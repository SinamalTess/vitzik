export type IntervalWorkerCode = 'start' | 'updateTimer' | 'stop' | 'pause' | 'restart'

export interface IntervalWorkerMessage {
    code: IntervalWorkerCode
    startAt?: number
    midiSpeedFactor?: number
}
