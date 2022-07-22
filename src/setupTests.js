// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'jest-canvas-mock'
import { WorkerMock } from './tests/mocks/worker'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import { AudioContext } from './tests/mocks/AudioContext'

// Mocks
global.URL.createObjectURL = () => {}
global.Worker = WorkerMock
global.navigator.requestMIDIAccess = requestMIDIAccess
global.AudioContext = AudioContext
