import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#060606] flex flex-col max-w-lg mx-auto">
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
