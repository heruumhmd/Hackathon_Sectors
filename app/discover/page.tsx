import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DiscoverUnifiedExperience } from '@/components/DiscoverUnifiedExperience'

export const metadata: Metadata = {
  title: 'Discover & Riset Terpandu — RASI',
  description:
    'Alur riset terpandu 4 tahap: Evaluasi Sinyal & Risiko Sesi, Akumulasi Broker, Radar Pasar, dan Sintesis Asisten AI.',
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[var(--rasi-muted)] space-y-2">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--rasi-primary)] border-t-transparent rounded-full" />
          <p>Memuat Discover & Riset Terpandu…</p>
        </div>
      }
    >
      <DiscoverUnifiedExperience />
    </Suspense>
  )
}
