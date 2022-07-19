import React, { useEffect, useState } from 'react'
import './MidiTitle.scss'
import { CSSTransition } from 'react-transition-group'
import { normalizeTitle } from '../../utils'

interface MidiTrackInfosPros {
    midiTitle: string
}

const ANIMATION_DURATION = 500
const BASE_CLASS = 'midi-title'

export function MidiTitle({ midiTitle }: MidiTrackInfosPros) {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const title = normalizeTitle(midiTitle)

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
            timeout={ANIMATION_DURATION}
            classNames={BASE_CLASS}
        >
            <div className={BASE_CLASS}>
                <p className={`${BASE_CLASS}__text`} data-text={title}>
                    {title}
                </p>
            </div>
        </CSSTransition>
    )
}
