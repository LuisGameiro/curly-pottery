import Navbar from '../Navbar'
import Footer from '../Footer'
import NewsletterBanner from '../NewsletterBanner/NewsletterBanner'
import FeatureBar from '../FeatureBar'

interface Props {
  children?: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NewsletterBanner />
      <main className="bg-background w-full flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <FeatureBar />
    </div>
  )
}
