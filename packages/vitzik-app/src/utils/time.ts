export const msToSec = (ms: number): number => ms / 1000

export const msToTime = (ms: number) => {
    const msDurationDate = new Date(ms)
    const hours = msDurationDate.getHours()
    const min = msDurationDate.getMinutes()
    const sec = msDurationDate.getSeconds()
    const msFormatted = msDurationDate.getMilliseconds() / 10

    return { hours, min, sec, ms: msFormatted }
}

const timeToString = (min: number, sec: number, ms: number, showMs?: boolean): string => {
    const minString = String(min).padStart(2, '0')
    const secString = String(sec).padStart(2, '0')
    const msString = String(ms).padStart(2, '0')

    return `${minString}:${secString}${showMs ? ':' + msString : ''}`
}

export const msToHumanReadableTime = (ms: number, showMs?: boolean): string => {
    const { min, sec, ms: msFormatted } = msToTime(ms)

    return timeToString(min, sec, msFormatted, showMs)
}
