'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FileCheck, PenTool, FileSignature, Zap } from 'lucide-react'

const visuals: Record<string, React.ReactNode> = {
  chat: (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-md max-h-[420px]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-200/60 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-orange-300/40 blur-3xl" />
        {/* Message bubbles */}
        <div className="absolute left-[15%] top-[20%] w-14 h-10 rounded-2xl rounded-bl-md bg-white/90 shadow-lg border border-orange-100 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-orange-500" />
        </div>
        <div className="absolute right-[20%] top-[35%] w-20 h-12 rounded-2xl rounded-br-md bg-orange-500/90 shadow-lg flex items-center justify-center">
          <span className="text-white text-xs font-medium">AI</span>
        </div>
        <div className="absolute left-[25%] bottom-[30%] w-16 h-10 rounded-2xl rounded-bl-md bg-white/90 shadow-lg border border-orange-100" />
        <div className="absolute right-[15%] bottom-[20%] w-12 h-8 rounded-xl rounded-br-md bg-orange-400/80 shadow-md" />
      </div>
    </div>
  ),
  review: (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-md max-h-[420px]">
        <div className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 rounded-full bg-teal-200/50 blur-3xl animate-pulse" />
        {/* Document with checkmarks */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 rounded-lg bg-white/95 shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="h-2 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="h-2 bg-emerald-100 rounded flex-1" />
            </div>
            <div className="h-2 bg-gray-200 rounded w-5/6" />
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="h-2 bg-emerald-100 rounded flex-1" />
            </div>
            <div className="h-2 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  ),
  generate: (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-md max-h-[420px]">
        <div className="absolute top-1/4 right-1/3 w-40 h-40 rounded-full bg-orange-200/50 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-amber-200/50 blur-3xl" />
        {/* Pen + document */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-44 h-52 rounded-lg bg-white/95 shadow-xl border border-gray-200 rotate-[-2deg] overflow-hidden">
            <div className="p-4 space-y-2">
              <div className="h-2.5 bg-gray-300 rounded w-2/3" />
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-4/5" />
              <div className="pt-2 flex items-center gap-1">
                <PenTool className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Drafting...</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-2 w-10 h-14 bg-gradient-to-b from-orange-400 to-orange-600 rounded-lg shadow-lg rotate-12 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  ),
  esign: (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-md max-h-[420px]">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 rounded-full bg-purple-200/40 blur-3xl animate-pulse" />
        {/* Signature line + doc */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-48 rounded-lg bg-white/95 shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="h-2 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="flex-1" />
            <div className="border-b-2 border-dashed border-gray-400 pt-8 relative">
              <FileSignature className="absolute -top-1 right-0 w-6 h-6 text-violet-500" />
              <span className="text-xs text-gray-500">Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  agent: (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-md max-h-[420px]">
        <div className="absolute top-1/4 left-1/3 w-36 h-36 rounded-full bg-amber-300/40 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-orange-300/40 blur-3xl" />
        {/* Automation flow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded" />
          <div className="w-12 h-12 rounded-lg bg-white border-2 border-orange-200 flex items-center justify-center shadow">
            <span className="text-xs font-bold text-gray-700">1</span>
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded" />
          <div className="w-12 h-12 rounded-lg bg-white border-2 border-orange-200 flex items-center justify-center shadow">
            <span className="text-xs font-bold text-gray-700">2</span>
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded" />
          <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  ),
}

export function FeatureVisual({ type, className = '' }: { type: string; className?: string }) {
  const content = visuals[type] ?? visuals.chat
  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/50 overflow-hidden ${className}`}
    >
      {content}
    </motion.div>
  )
}
