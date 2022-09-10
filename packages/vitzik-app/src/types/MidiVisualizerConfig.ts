import { LoopTimestamps } from './LoopTimestamps'

export interface MidiVisualizerConfig extends MidiVisualizerUserConfig {
    height: number
    width: number
}

export interface MidiVisualizerUserConfig {
    midiSpeedFactor?: number
    msPerSection: number
    showDampPedal: boolean
    showLoopEditor: boolean
    activeTracks: number[]
    loopTimestamps: LoopTimestamps
}
