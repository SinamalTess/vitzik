export const msToSec = (ms: number): number => ms / 1000

export const msToMinAndSec = (msDuration: number): string => {
    const msDurationDate = new Date(msDuration)
    const min = String(msDurationDate.getMinutes()).padStart(2, '0')
    const sec = String(msDurationDate.getSeconds()).padStart(2, '0')

    return `${min}:${sec}`
}
