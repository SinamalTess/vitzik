import React, { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'
import './Tooltip.scss'

interface TooltipProps {
    children: ReactNode
    arrow?: boolean
}

export function Tooltip({ children, arrow = true }: TooltipProps) {
    const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    })

    if (!children || !Array.isArray(children)) return null

    return (
        <>
            <span ref={setReferenceElement}>{children[0]}</span>

            <div
                className={'tooltip'}
                role="tooltip"
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
            >
                {children.map((child, index) => (index === 0 ? null : child))}
                {arrow ? (
                    <div ref={setArrowElement} style={styles.arrow} className={'tooltip__arrow'} />
                ) : null}
            </div>
        </>
    )
}
