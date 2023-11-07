import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from "@/providers";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-custom-light`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
