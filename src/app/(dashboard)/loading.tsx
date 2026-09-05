import { Kerangka, KerangkaTabel } from '@/components/ui/states';

export default function MemuatDashboard() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Memuat halaman">
      <div className="space-y-2">
        <Kerangka className="h-8 w-56" />
        <Kerangka className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Kerangka key={index} className="h-32 rounded-[var(--radius-kartu)]" />
        ))}
      </div>
      <div className="rounded-[var(--radius-kartu)] border border-beige-200 bg-white/70">
        <KerangkaTabel />
      </div>
    </div>
  );
}
