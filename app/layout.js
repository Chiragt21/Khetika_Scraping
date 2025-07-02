import './globals.css'

export const metadata = {
  title: 'Blinkit Scraper Dashboard',
  description: 'Manage and monitor your Blinkit product scraper',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
} 