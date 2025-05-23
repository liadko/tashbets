import React from 'react'
import './Toaster.css'

export type Toast = { id: number; message: string }

interface ToasterProps {
  toasts: Toast[]
}

export function Toaster({ toasts }: ToasterProps) {
  return (
    <div className="toaster">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}