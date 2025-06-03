import React from 'react'
import './Toaster.css'

export type Toast = { id: number; message: string }

interface ToasterProps {
  toasts: Toast[]
  raised?: boolean
}

export function Toaster({ toasts, raised=false }: ToasterProps) {
  return (
    <div className={"toaster" + (raised ? " raised" : "")}>
      {toasts.map(t => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}