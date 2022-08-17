export const msToSec = (ms: number): number => ms / 1000

export const msToHumanReadableTime = (ms: number, showMs?: boolean): string => {
    const msDurationDate = new Date(ms)
    const min = String(msDurationDate.getMinutes()).padStart(2, '0')
    const sec = String(msDurationDate.getSeconds()).padStart(2, '0')
    const milliseconds = String(msDurationDate.getMilliseconds()).padStart(2, '0')

    return `${min}:${sec}${showMs ? ':' + milliseconds : ''}`
}
