// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "vitest-canvas-mock";
import { IntervalWorkerMessengerMock } from "./src/tests/mocks/IntervalWorkerMessengerMock";
import { vi, expect, beforeAll } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { AudioContextMock } from "./src/tests/mocks/AudioContextMock";
import { requestMIDIAccess } from "./src/tests/mocks/requestMIDIAccess";
import React from "react";
import { WorkerMock } from "./src/tests/mocks/WorkerMock";

expect.extend(matchers);

vi.stubGlobal("Worker", WorkerMock);

window.navigator.requestMIDIAccess = requestMIDIAccess;

vi.stubGlobal("AudioContext", AudioContextMock);

vi.mock("midi-json-parser", () => ({
  default: {
    parseArrayBuffer: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("./components/_hocs/WithContainerDimensions", () => ({
  default: (Component) => (props) => (
    <Component {...props} height={100} width={200} />
  ),
}));

vi.mock("soundfont-player", () => ({
  default: {
    instrument: vi.fn(),
  },
}));
