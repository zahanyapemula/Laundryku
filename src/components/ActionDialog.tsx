import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  PartyPopper,
  XCircle,
} from 'lucide-react'
import { useStore } from '../store'
import Modal from './Modal'
import { Button } from './ui'

/**
 * Popup dialog interaktif untuk aksi penting:
 * konfirmasi sebelum impactful (batal, ganti jadwal)
 * dan popup sukses setelah aksi berhasil.
 */
export default function ActionDialog() {
  const { dialog, closeDialog } = useStore()
  const navigate = useNavigate()
  if (!dialog) return null

  const isConfirm = dialog.type === 'confirm'
  const tone = dialog.tone ?? (isConfirm ? 'warning' : 'primary')

  const icon =
    dialog.type === 'success' ? (
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-light">
        <PartyPopper size={30} className="text-secondary-dark" />
      </span>
    ) : dialog.type === 'error' ? (
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-light">
        <XCircle size={30} className="text-danger" />
      </span>
    ) : isConfirm ? (
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-light">
        <AlertTriangle size={30} className="text-warning-dark" />
      </span>
    ) : (
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
        <Info size={30} className="text-primary" />
      </span>
    )

  const handleConfirm = () => {
    const action = dialog.onConfirm
    closeDialog()
    if (action) action()
  }

  const handleExtra = (to: string) => {
    closeDialog()
    navigate(to)
  }

  return (
    <Modal open={!!dialog} onClose={closeDialog} title="" description="">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {icon}
        <div>
          <h3 className="text-lg font-extrabold text-slate-800">{dialog.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {dialog.message}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {isConfirm ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={closeDialog}
            >
              {dialog.cancelLabel ?? 'Batal'}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              className="flex-1"
              icon={tone === 'danger' ? XCircle : CheckCircle2}
              onClick={handleConfirm}
            >
              {dialog.confirmLabel ?? 'Ya, Lanjutkan'}
            </Button>
          </div>
        ) : (
          <Button full icon={CheckCircle2} onClick={handleConfirm}>
            {dialog.confirmLabel ?? 'Mengerti'}
          </Button>
        )}

        {dialog.extra?.map((e) => (
          <Button
            key={e.label}
            full
            variant="ghost"
            onClick={() => handleExtra(e.to)}
          >
            {e.label}
          </Button>
        ))}
      </div>
    </Modal>
  )
}