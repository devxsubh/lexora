'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Brain, CheckCircle2, AlertTriangle, MousePointer2, Sparkles, FileSignature, Zap } from 'lucide-react'

type HeroFlowVisualProps = {
  activeNavId: string
  className?: string
}

const steps = [
  {
    id: 'dashboard',
    label: 'Contracts home',
    badge: 'Step 1',
  },
  {
    id: 'upload',
    label: 'Upload contract',
    badge: 'Step 2',
  },
  {
    id: 'editor',
    label: 'Review in editor',
    badge: 'Step 3',
  },
  {
    id: 'ai',
    label: 'AI review & fixes',
    badge: 'Step 4',
  },
]

const ModeVisual: React.FC<HeroFlowVisualProps> = ({ activeNavId, className = '' }) => {
  return (
    <motion.div
      className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/40 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-full w-full flex items-center justify-center px-4 py-6 lg:px-10">
        <div className="relative w-full max-w-xl rounded-3xl bg-white border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <span className="text-[11px] font-medium text-gray-500">
                {activeNavId === 'chat'
                  ? 'Lexora · AI Chat'
                  : activeNavId === 'generate'
                  ? 'Lexora · Generate contract'
                  : activeNavId === 'esign'
                  ? 'Lexora · E‑Sign'
                  : 'Lexora · Automation'}
              </span>
            </div>
          </div>

          {/* Mode-specific body */}
          <div className="relative px-5 py-4 bg-gray-50/50 min-h-[260px] flex items-center justify-center">
            {activeNavId === 'chat' && (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm space-y-2">
                  <div className="text-[11px] font-semibold text-gray-900">Ask Lexora anything</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="inline-flex max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-1.5 text-gray-800">
                      Help me draft an NDA for a sales partnership.
                    </div>
                    <div className="inline-flex max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-3 py-1.5 text-white text-[11px]">
                      Sure. I&apos;ll generate a balanced NDA with standard liability caps and confidentiality terms.
                    </div>
                    <div className="inline-flex max-w-[75%] rounded-2xl rounded-br-sm bg-orange-500/90 px-3 py-1.5 text-white text-[11px]">
                      I&apos;ll also flag any risky clauses and suggest safer language.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-[11px] text-gray-500">
                  <span className="flex-1 truncate">“Draft an NDA for a new vendor...”</span>
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <MousePointer2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {activeNavId === 'generate' && (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm space-y-2">
                  <div className="text-[11px] font-semibold text-gray-900">Generate contract</div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <p className="text-gray-600">
                      Lexora is drafting a customized agreement based on your prompt and playbook.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm space-y-1">
                  <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-4/5" />
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>AI clause suggestions enabled</span>
                  </div>
                </div>
              </div>
            )}

            {activeNavId === 'esign' && (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-gray-900">Signature packet</p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                      Ready to send
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Signer 1 · Acme</span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Signer 2 · Lexora</span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-dashed border-gray-300 pt-4 relative">
                    <span className="absolute -top-3 right-0 px-2 py-0.5 rounded-full bg-gray-900 text-white text-[9px] font-medium flex items-center gap-1">
                      <FileSignature className="w-3 h-3" />
                      Sign here
                    </span>
                    <div className="h-7 rounded-lg bg-gray-50 border border-gray-200" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <button className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-[11px] font-medium">
                    Send for signature
                  </button>
                  <button className="px-3 py-1.5 rounded-full border border-gray-300 text-[11px] font-medium text-gray-700">
                    Preview packet
                  </button>
                </div>
              </div>
            )}

            {activeNavId === 'agent' && (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">Contract automation</p>
                      <p className="text-[10px] text-gray-500">Agent running your playbook end‑to‑end.</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full w-2/3 rounded-full bg-orange-500" />
                    </div>
                    <span className="text-[10px] text-gray-500">2 of 3 steps</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Generated NDA from intake form</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Applied playbook rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Waiting on business approval</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ReviewFlowVisual: React.FC<HeroFlowVisualProps> = ({ activeNavId, className = '' }) => {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length)
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  const currentStep = steps[stepIndex]

  return (
    <motion.div
      className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/40 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-full w-full flex items-center justify-center px-4 py-6 lg:px-10">
        {/* Main mock window – full Lexora-like frame */}
        <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <span className="text-[11px] font-medium text-gray-500">
                Lexora · Contracts workspace
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600 font-medium">
                {activeNavId === 'review' ? 'Review' : activeNavId === 'generate' ? 'Generate' : activeNavId === 'esign' ? 'E‑Sign' : 'Chat · AI'}
              </span>
            </div>
          </div>

          <div className="relative flex">
            {/* Sidebar */}
            <div className="hidden md:flex w-16 flex-shrink-0 flex-col items-center gap-4 bg-white border-r border-gray-100 py-4">
              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white text-xs font-semibold flex items-center justify-center">
                L
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
            </div>

            {/* Main content area */}
            <div className="flex-1 bg-gray-50/60 px-4 py-4 space-y-3 border-r border-gray-100">
              {/* Step label */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-gray-200 px-2.5 py-1 text-[10px] text-gray-700">
                <span className="rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[9px] font-semibold">
                  {currentStep.badge}
                </span>
                <span>{currentStep.label}</span>
              </div>

              <AnimatePresence mode="wait">
                {/* Dashboard scene */}
                {stepIndex === 0 && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mt-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-gray-900">Contracts</p>
                        <p className="text-[11px] text-gray-500">All NDAs, MSAs and SOWs in one place.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2.5 py-1.5 rounded-full bg-gray-900 text-white text-[11px] font-medium">
                          New contract
                        </button>
                        <button className="px-2.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-[11px] font-medium text-orange-700">
                          Upload file
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {['Acme NDA.pdf', 'Vendor MSA.docx', 'Sales SOW v3.docx'].map((name, i) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-gray-800">{name}</span>
                          </div>
                          <span className="text-gray-400">{i === 0 ? 'Draft' : 'Signed'}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Upload scene */}
                {stepIndex === 1 && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 mx-auto max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200 px-4 py-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      Upload a contract
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Drag a file here or browse from your computer.
                    </p>
                    <div className="mt-2 bg-gray-50 border-2 border-dashed border-orange-200 rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="w-5 h-5 text-orange-600" />
                      <p className="text-xs font-medium text-gray-900">Drop file to upload to Lexora</p>
                      <p className="text-[10px] text-gray-500">PDF · DOCX · HTML</p>
                    </div>
                  </motion.div>
                )}

                {/* Editor scene */}
                {stepIndex === 2 && (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mt-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[11px] font-medium text-gray-800">
                          Acme NDA · Draft
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-7 h-2 bg-gray-200 rounded-full" />
                        <span className="w-4 h-2 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                    <div className="px-3.5 py-3 space-y-1.5 text-[11px] text-gray-700">
                      <p className="leading-relaxed">
                        This Non‑Disclosure Agreement (&quot;Agreement&quot;) is entered into between Acme Inc. and
                        Recipient to protect confidential information shared for evaluation purposes.
                      </p>
                      <p className="leading-relaxed">
                        During the term of this Agreement, each party shall maintain strict confidentiality and shall
                        not disclose any Confidential Information to third parties without prior written consent.
                      </p>
                      <p className="leading-relaxed">
                        <span className="bg-amber-50 border border-amber-200 text-amber-900 px-1 rounded-sm">
                          Liability is unlimited and includes indirect or consequential damages.
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right column: AI review panel */}
            <div className="w-44 sm:w-52 md:w-60 bg-white px-3.5 py-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 leading-tight">AI Review</p>
                    <p className="text-[10px] text-gray-500">
                      3 issues · 2 fixes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="rounded-lg border border-orange-100 bg-orange-50/80 px-2.5 py-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-semibold text-gray-900">
                        Unlimited liability
                      </span>
                    </div>
                    <button className="text-[9px] font-semibold text-orange-700 bg-white px-1.5 py-0.5 rounded-full border border-orange-100">
                      Fix
                    </button>
                  </div>
                  <p className="mt-0.5 text-[9px] text-gray-700">
                    Cap liability at 12 months of fees and exclude indirect damages.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] text-gray-800">Missing termination clause</span>
                    <button className="text-[9px] text-orange-700 font-medium">Insert</button>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Standard NDA template verified</span>
                </div>
              </div>

              <button className="mt-1 text-[10px] font-medium text-orange-700 hover:text-orange-800">
                Apply all fixes
              </button>
            </div>

            {/* Animated cursor overlay */}
            <motion.div
              className="pointer-events-none absolute"
              initial={false}
              animate={{
                x: stepIndex === 0 ? 110 : stepIndex === 1 ? 210 : stepIndex === 2 ? 220 : 310,
                y: stepIndex === 0 ? 90 : stepIndex === 1 ? 170 : stepIndex === 2 ? 130 : 110,
              }}
              transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center">
                  <MousePointer2 className="w-3.5 h-3.5 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const HeroFlowVisual: React.FC<HeroFlowVisualProps> = ({ activeNavId, className = '' }) => {
  if (activeNavId !== 'review') {
    return <ModeVisual activeNavId={activeNavId} className={className} />
  }
  return <ReviewFlowVisual activeNavId={activeNavId} className={className} />
}


