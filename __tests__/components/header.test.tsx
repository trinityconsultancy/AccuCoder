import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/components/header'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Header Component', () => {
  it('renders the AccuCoder logo', () => {
    render(<Header />)
    
    const logo = screen.getByText(/AccuCoder/i)
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    
    // Check for main navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { container } = render(<Header />)
    
    // Header should be wrapped in a header tag
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })
})
