import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import BulletRewriter from '../components/BulletRewriter'
import { describe, it, expect } from "vitest";
const renderComponent = () => render(
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider>
                <BulletRewriter />
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
)

describe('BulletRewriter', () => {
    it('should render textarea and button', () => {
        renderComponent()
        expect(screen.getByRole('textbox', { name: /resume bullet point/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /rewrite with ai/i })).toBeInTheDocument()
    })

    it('should render optional JD input', () => {
        renderComponent()
        expect(screen.getByPlaceholderText(/optional/i)).toBeInTheDocument()
    })
})
