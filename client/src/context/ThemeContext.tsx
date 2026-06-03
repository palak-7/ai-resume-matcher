import { useEffect, useState } from 'react'
import { ThemeContext } from "./theme-context";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark'
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