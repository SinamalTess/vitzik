// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'jest-canvas-mock'
import { Worker } from './tests/mocks/worker'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import { AudioContext } from './tests/mocks/AudioContext'

global.URL.createObjectURL = () => {}
global.Worker = Worker
global.navigator.requestMIDIAccess = requestMIDIAccess
global.AudioContext = AudioContext
