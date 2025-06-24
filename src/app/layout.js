import './globals.css'

export const metadata = {
  title: 'Manajemen Stok',
  description: 'Aplikasi Manajemen Stok Sederhana',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
