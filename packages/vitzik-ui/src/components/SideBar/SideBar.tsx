import React, { ReactNode, useEffect, useRef, useState } from 'react'
import './SideBar.scss'
import clsx from 'clsx'
import { CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom'
import { useClickOutside } from '../../hooks/useClickOutside'
import { PresentationalComponentBasicProps } from '../../types'

interface SideBarProps extends PresentationalComponentBasicProps {
    open: boolean
    children: ReactNode
    position: 'top' | 'left' | 'right' | 'bottom'
    onClose: () => void
}

const BASE_CLASS = 'sidebar'
const ANIMATION_DURATION = 300

export function SideBar({
    style,
    className,
    children,
    open,
    position = 'right',
    onClose,
}: SideBarProps) {
    const [isOpen, setIsOpen] = useState(open)
    const ref = useRef<HTMLDivElement>(null)
    const rootNode = document.getElementById('root') ?? document.body

    useEffect(() => setIsOpen(open), [open])
    useClickOutside([ref], closeSideBar, isOpen)

    function closeSideBar() {
        setIsOpen(false)
        onClose()
    }

    const classNames = clsx(BASE_CLASS, `${BASE_CLASS}--${position}`, className)

    return ReactDOM.createPortal(
        <CSSTransition
            unmountOnExit
            appear={isOpen}
            in={isOpen}
            timeout={ANIMATION_DURATION}
            classNames={classNames}
        >
            <div className={classNames} ref={ref} style={style}>
                {children}
            </div>
        </CSSTransition>,
        rootNode
    )
}
