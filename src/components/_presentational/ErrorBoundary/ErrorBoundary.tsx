import React, { ErrorInfo, ReactNode } from 'react'
import './ErrorBoundary.scss'
import clsx from 'clsx'

interface ErrorBoundaryProps {
    children?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

const classNames = clsx('error-boundary')

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
        }
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // can be used to report the error with console.log()...
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className={classNames}>
                    <h1>Something went wrong.</h1>
                    {this.state.error?.message}
                    <br />
                    {this.state.error?.stack}
                </div>
            )
        }

        return this.props.children
    }
}
