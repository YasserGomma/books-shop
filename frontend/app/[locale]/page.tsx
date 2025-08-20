import React from 'react'
import { redirect } from 'next/navigation'

export default function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params)
  redirect(`/${locale}/books`)
}