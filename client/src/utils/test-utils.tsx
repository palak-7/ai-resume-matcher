import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'

export const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    })

export const renderWithProviders = (ui: ReactElement) => {
    const queryClient = createTestQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        {ui}
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}