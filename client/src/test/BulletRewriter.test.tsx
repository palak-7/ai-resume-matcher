import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import BulletRewriter from '../components/BulletRewriter'
import { renderWithProviders } from '../utils/test-utils'

describe('BulletRewriter', () => {
    it('should render textarea and button', () => {
        renderWithProviders(<BulletRewriter />)

        expect(
            screen.getByRole('textbox', {
                name: /resume bullet point/i,
            })
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: /rewrite with ai/i,
            })
        ).toBeInTheDocument()
    })

    it('should render optional JD input', () => {
        renderWithProviders(<BulletRewriter />)

        expect(
            screen.getByPlaceholderText(/optional/i)
        ).toBeInTheDocument()
    })
})