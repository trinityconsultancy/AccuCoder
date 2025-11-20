'use client'

export default function IndexPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center space-y-4 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <svg 
            className="w-10 h-10 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Welcome to AccuCoder</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          This is your default home page. Select a feature from the navigation menu to get started.
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
            <span className="text-sm text-muted-foreground">💡 Use the sidebar to explore features</span>
          </div>
        </div>
      </div>
    </div>
  )
}
