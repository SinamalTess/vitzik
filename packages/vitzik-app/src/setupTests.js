// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { IntervalWorkerMock } from './tests/mocks/intervalWorker'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import { AudioContextMock } from './tests/mocks/AudioContextMock'

// Mocks
global.URL.createObjectURL = () => {}
global.Worker = IntervalWorkerMock
global.navigator.requestMIDIAccess = requestMIDIAccess
global.AudioContext = AudioContextMock
