export function msToMinAndSec(msDuration: number): string {
    const msDurationDate = new Date(msDuration)
    const min = String(msDurationDate.getMinutes()).padStart(2, '0')
    const sec = String(msDurationDate.getSeconds()).padStart(2, '0')

    return `${min}:${sec}`
}

export function msToSec(ms: number): number {
    return ms / 1000
}
