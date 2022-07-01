import React, { useEffect, useState } from 'react'
import './MidiTitle.scss'
import { CSSTransition } from 'react-transition-group'

interface MidiTrackInfosPros {
    midiTitle: string
}

function normalizeTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')
    const results = normalizedTitle.match(/.midi|.mid/) ?? []
    if (results.length > 0) {
        return normalizedTitle.slice(0, normalizedTitle.length - results[0].length)
    }
    return normalizedTitle
}

export function MidiTitle({ midiTitle }: MidiTrackInfosPros) {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const title = normalizeTitle(midiTitle)
    const animationDuration = 500

    useEffect(() => {
        setIsVisible(true)
        const stopAnimation = setTimeout(() => setIsVisible(false), 1000)
        return function cleanup() {
            clearTimeout(stopAnimation)
        }
    }, [midiTitle])

    return (
        <CSSTransition
            unmountOnExit
            appear={isVisible}
            in={isVisible}
            timeout={animationDuration}
            classNames="my-node"
        >
            <div className="midi-title midi-title--active">
                <p className="midi-title__text" data-text={title}>
                    {title}
                </p>
            </div>
        </CSSTransition>
    )
}
