import { Spinner } from '@/components/ui/spinner';

export default function MemuatMasuk() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Memuat">
      <Spinner className="h-8 w-8 text-matcha-600" />
    </div>
  );
}
