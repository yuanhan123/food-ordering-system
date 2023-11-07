'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

export * from '@chakra-ui/react'
export * from '@chakra-ui/icon'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <CacheProvider>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </CacheProvider>
    </SessionProvider>
  )
}