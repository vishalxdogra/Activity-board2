import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    ONE_OFF: 'One-time',
    WEEKLY: 'Weekly',
    FORTNIGHTLY: 'Fortnightly',
    MONTHLY: 'Monthly',
    ON_DEMAND: 'On-demand',
  }
  return labels[frequency] || frequency
}

export function getGenreLabel(genre: string): string {
  const labels: Record<string, string> = {
    TECH: 'Technology',
    ART: 'Art',
    MUSIC: 'Music',
    DANCE: 'Dance',
    SPORTS: 'Sports',
    OTHER: 'Other',
  }
  return labels[genre] || genre
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Open Event',
    COMMUNITY: 'Community',
    COLLEGE_FUNDED: 'College Funded',
  }
  return labels[type] || type
}
