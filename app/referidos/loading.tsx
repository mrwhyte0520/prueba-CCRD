import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
