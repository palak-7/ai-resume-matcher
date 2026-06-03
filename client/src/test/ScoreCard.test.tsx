import { render, screen, within } from '@testing-library/react'
import ScoreCard from '../components/ScoreCard'
import { describe, it, expect } from "vitest";

const mockProps = {
    matchScore: 85,
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: [
        { skill: 'GraphQL', severity: 'high' as const },
        { skill: 'Docker', severity: 'medium' as const },
    ],
    suggestions: ['Add GraphQL to your skillset', 'Learn Docker basics'],
}

describe('ScoreCard', () => {
    it('should render match score', () => {
        render(<ScoreCard {...mockProps} />)
        expect(screen.getAllByText('85%').length).toBeGreaterThan(0)
    })

    it('should render matched skills as green badges', () => {
        render(<ScoreCard {...mockProps} />)
        expect(screen.getByText('✓ React')).toBeInTheDocument()
        expect(screen.getByText('✓ TypeScript')).toBeInTheDocument()
    })

    it('should render missing skills with severity', () => {
        render(<ScoreCard {...mockProps} />)
        const missingSkillsCard = screen.getByText(/Missing Skills/).closest('div')

        expect(missingSkillsCard).toBeInTheDocument()
        expect(within(missingSkillsCard!).getByText(/GraphQL/)).toBeInTheDocument()
        expect(within(missingSkillsCard!).getByText(/Docker/)).toBeInTheDocument()
    })

    it('should render AI suggestions', () => {
        render(<ScoreCard {...mockProps} />)
        expect(screen.getByText('Add GraphQL to your skillset')).toBeInTheDocument()
    })

    it('should show strong match message for score >= 75', () => {
        render(<ScoreCard {...mockProps} />)
        expect(screen.getByText(/apply with confidence/i)).toBeInTheDocument()
    })

    it('should show weak match message for low score', () => {
        render(<ScoreCard {...mockProps} matchScore={30} />)
        expect(screen.getByText(/significant gaps/i)).toBeInTheDocument()
    })
})
