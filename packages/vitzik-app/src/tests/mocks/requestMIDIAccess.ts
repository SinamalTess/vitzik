export const requestMIDIAccess = vi.fn()
const onmidimessage = vi.fn()
const removeEventListener = vi.fn()

export const midiAccessMock = (midiInputs?: MidiInputMock[], midiOutputs?: MidiInputMock[]) => ({
    inputs: {
        values: () => (midiInputs ? midiInputs : []),
    },
    outputs: {
        values: () => (midiOutputs ? midiOutputs : []),
    },
})

export class MidiInputMock {
    dispatchEvent: Function[]
    onmidimessage: Function
    addEventListener: (eventType: string, callback: Function) => void
    removeEventListener: () => void
    id: string
    name: string
    manufacturer: string

    constructor(name: string, manufacturer: string) {
        this.dispatchEvent = []
        this.onmidimessage = onmidimessage
        this.addEventListener = (eventType: string, callback: Function) =>
            (this.dispatchEvent = [...this.dispatchEvent, callback])
        this.removeEventListener = removeEventListener
        this.id = '1'
        this.manufacturer = manufacturer
        this.name = name
    }
}
