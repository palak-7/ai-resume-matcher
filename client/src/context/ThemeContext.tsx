import { useEffect, useState } from 'react'
import { ThemeContext } from "./theme-context";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme')

        if (savedTheme) {
            return savedTheme === 'dark'
        }

        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }, [isDark])

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(p => !p) }}>
            {children}
        </ThemeContext.Provider>
    )
}
