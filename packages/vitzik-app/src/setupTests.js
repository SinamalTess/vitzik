// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'jest-canvas-mock'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import { AudioContextMock } from './tests/mocks/AudioContextMock'
import { IntervalWorkerMessengerMock } from './tests/mocks/IntervalWorkerMessengerMock'

global.Worker = jest.fn()
global.navigator.requestMIDIAccess = requestMIDIAccess
global.AudioContext = AudioContextMock

export const mockIntervalWorker = new IntervalWorkerMessengerMock()

jest.mock('./components/_contexts/IntervalWorkerContext', () => {
    const React = require('react')
    return {
        IntervalWorkerContext: React.createContext({
            intervalWorker: mockIntervalWorker,
        }),
    }
})

jest.mock('midi-json-parser', () => () => {})

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

jest.mock('./components/_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component) => (props) => {
        return <Component {...props} height={100} width={200} />
    },
}))
