import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayButton } from './PlayButton'
import React, { useEffect, useState } from 'react'
import { msToMinAndSec } from '../utils'
import { usePrevious } from '../hooks'
import workerInterval from '../workers/workerInterval'

export type AudioPlayerState = 'playing' | 'rewinding' | 'paused' | 'seeking'

interface AudioPlayerProps {
    midiTrackCurrentTime: number
    midiTrackDuration: number
    isMute: boolean
    onToggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiTrackCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

function WebWorker(worker: any): Worker {
    const code = worker.toString()
    const blob = new Blob(['(' + code + ')()'])
    return new Worker(URL.createObjectURL(blob))
}

export function AudioPlayer({
    midiTrackCurrentTime,
    midiTrackDuration,
    isMute,
    onToggleSound,
    onChangeAudioPlayerState,
    onChangeMidiTrackCurrentTime,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiTrackCurrentTime)
    const totalTime = msToMinAndSec(midiTrackDuration)
    const prevMidiTrackCurrentTime = usePrevious(midiTrackCurrentTime) ?? 0

    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)

    useEffect(() => {
        let worker: Worker = WebWorker(workerInterval)

        function startWorker() {
            worker.postMessage('start')
            worker.onmessage = (message) => {
                if (message.data.hasOwnProperty('interval')) {
                    const interval = message.data.interval
                    const setMidiTrackCurrentTime = handlePlay()
                    setMidiTrackCurrentTime((midiTrackCurrentTime: number) => {
                        if (midiTrackCurrentTime > midiTrackDuration) {
                            worker.terminate()
                            setIsPlaying(false)
                            handlePause()
                            return 0
                        }
                        return midiTrackCurrentTime + interval
                    })
                }
            }
        }

        if (isPlaying && !isSearching) {
            startWorker()
        } else {
            worker.terminate()
            handlePause()
        }

        return () => {
            worker.terminate()
            handlePause()
        }
    }, [isPlaying, isSearching])

    function handleChange(midiTrackCurrentTime: number) {
        if (midiTrackCurrentTime <= prevMidiTrackCurrentTime) {
            onChangeAudioPlayerState('rewinding')
        } else {
            onChangeAudioPlayerState('seeking')
        }
        onChangeMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handlePlay() {
        onChangeAudioPlayerState('playing')
        return onChangeMidiTrackCurrentTime
    }

    function handlePause() {
        onChangeAudioPlayerState('paused')
    }

    function handleClick() {
        setIsPlaying((isPlaying) => !isPlaying)
    }

    function handleMouseDown() {
        setIsSearching(true)
    }

    function handleMouseUp() {
        setIsSearching(false)
    }

    return (
        <div className="audioplayer">
            {currentTime}
            <RangeSlider
                value={midiTrackCurrentTime}
                max={midiTrackDuration}
                onChange={handleChange}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
            {totalTime}
            <SoundController isMute={isMute} onToggleSound={onToggleSound} />
            <PlayButton onClick={handleClick} isPlaying={isPlaying} />
        </div>
    )
}
