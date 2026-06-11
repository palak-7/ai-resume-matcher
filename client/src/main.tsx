import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import App from './App'
import ReactDOM from 'react-dom/client'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — data fresh maana jaayega
      retry: 2,                        // fail hone pe 2 baar retry
      refetchOnWindowFocus: true,      // tab switch karne pe auto refresh
    },
    mutations: {
      retry: 0,                        // mutations retry mat karo
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Development mein query inspector dikhega */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)