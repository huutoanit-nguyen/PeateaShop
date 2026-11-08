import { LoaderCircle } from 'lucide-react'

type PageLoaderProps = {
  className?: string
}

export default function PageLoader({ className = 'page-loader' }: PageLoaderProps) {
  return (
    <div className={className} role="status" aria-live="polite">
      <LoaderCircle className="page-loader-spinner" size={20} aria-hidden="true" />
      <span>Đang tải...</span>
    </div>
  )
}
