import { useEffect } from 'react'

/*
    Custom hook that sets the title value for a page.
*/
export const useTitle = (title: string) =>
    useEffect(() => {
        document.title = title
    }, [])
