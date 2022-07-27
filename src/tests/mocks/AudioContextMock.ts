export class AudioContextMock {
    close = () => new Promise(() => {})
    resume = () => new Promise(() => {})
    suspend = () => new Promise(() => {})
}
