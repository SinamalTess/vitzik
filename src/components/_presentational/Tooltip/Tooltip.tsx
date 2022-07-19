import React, { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'
import './Tooltip.scss'
import { beforeWrite } from '@popperjs/core'
import clsx from 'clsx'
import { useClickOutside } from '../../../_hooks'
import { PresentationalComponentBasicProps } from '../types'
import { isArrayOfChildren } from '../utils/isArrayOfChildren'

interface TooltipProps extends PresentationalComponentBasicProps {
    children: ReactNode
    arrow?: boolean
    referenceWidth?: boolean
    show?: boolean
    showOnHover?: boolean
    onShow?: () => void
    onHide?: () => void
}

const BASE_CLASS = 'tooltip'

export function Tooltip({
    style,
    className,
    children,
    arrow = true,
    referenceWidth = false,
    show = false,
    showOnHover = false,
    onShow = () => {},
    onHide = () => {},
}: TooltipProps) {
    /*
        We have to use useMemo to define a custom modifier 
        See this : https://popper.js.org/react-popper/v2/faq/
    */
    const referenceWidthModifier = React.useMemo(
        () => ({
            name: 'sameWidth',
            enabled: true,
            fn: ({ state }: any) => {
                state.styles.popper.width = `${state.rects.reference.width}px`
            },
            phase: beforeWrite,
            requires: ['computeStyles'],
        }),
        []
    )

    const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLSpanElement | null>(null)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const [isOpen, setOpen] = useState(false)
    const isVisible = isOpen || show

    let modifiers = [
        { name: 'offset', options: { offset: referenceWidth ? [0, 0] : [0, 8] } },
        { name: 'arrow', options: { element: arrowElement } },
    ]

    if (referenceWidth) {
        // @ts-ignore
        modifiers.push(referenceWidthModifier)
    }

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers,
        placement: 'bottom',
    })

    function onClickOutside() {
        onHide()
    }

    useClickOutside([referenceElement], onClickOutside, show)

    if (!isArrayOfChildren(children, Tooltip.name)) return null

    const referenceChild = children[0]
    const tooltipChild = children[1]

    const props = showOnHover
        ? {
              onMouseEnter: () => {
                  setOpen(true)
                  onShow()
              },
              onMouseLeave: () => {
                  setOpen(false)
                  onHide()
              },
          }
        : {}

    const classNames = clsx(BASE_CLASS, { [`${BASE_CLASS}--active`]: isVisible }, className)

    const styleTooltip = {
        ...styles.popper,
        ...{ style },
    }

    return (
        <>
            {React.cloneElement(referenceChild, { ref: setReferenceElement, ...props })}

            {isVisible ? (
                <span
                    className={classNames}
                    role="tooltip"
                    ref={setPopperElement}
                    style={styleTooltip}
                    {...attributes.popper}
                >
                    {arrow ? (
                        <div
                            ref={setArrowElement}
                            style={styles.arrow}
                            className={`${BASE_CLASS}__arrow`}
                        />
                    ) : null}
                    {tooltipChild}
                </span>
            ) : null}
        </>
    )
}
