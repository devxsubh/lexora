'use client'

import React, { useState } from 'react'
import {
  Plus,
  ChevronDown,
  Video,
  Mic,
  FileCheck,
  AlertTriangle,
  FileText,
  Sparkles,
  Send,
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useRouter } from 'next/navigation'

const AGENT_OPTIONS = [
  { id: 'review', label: 'Agent to review', icon: FileCheck },
  { id: 'risk', label: 'Agent to find risk', icon: AlertTriangle },
  { id: 'generate', label: 'Agent to generate contract', icon: FileText },
]

const MODELS = ['Lexora Mini', 'Lexora Pro', 'Lexora Max']

export function ContractsHubMain() {
  const router = useRouter()
  const [agentsOpen, setAgentsOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0])

  const goToWorkspace = () => {
    const q = prompt.trim()
    router.push(`/contracts/workspace${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  return (
    <main className="flex-1 flex flex-col bg-white overflow-auto relative">
      {/* Subtle grid background - same as landing */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Watermark / branding */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[12rem] font-bold text-gray-100/30 select-none tracking-tighter">
          Lexora
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-16 py-10 sm:py-14 lg:py-16 min-h-[calc(100vh-14rem)]">
        <div className="w-full max-w-4xl lg:max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-3 sm:mb-4 leading-tight">
            What contract do you want to create today?
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            Describe what you need or ask Lexora to build—contracts, clauses, or full agreements in seconds.
          </p>

          {/* Big input box - wide, landing-style */}
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 w-full max-w-5xl mx-auto rounded-2xl sm:rounded-xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:border-orange-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all px-3 py-3 sm:px-4 sm:py-3.5">
            {/* + Agents */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => { setAgentsOpen(!agentsOpen); modelOpen && setModelOpen(false); projectOpen && setProjectOpen(false) }}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                  agentsOpen ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'
                )}
                title="Add agent"
              >
                <Plus className="w-5 h-5" />
              </button>
              {agentsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAgentsOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 py-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[220px]">
                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Agents
                    </div>
                    {AGENT_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setAgentsOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-orange-500" />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Center input + controls in a responsive stack */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToWorkspace()
                }}
                placeholder="Ask Lexora to build..."
                className="w-full py-2.5 sm:py-3 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base"
              />
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                {/* Model selector */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => {
                      setModelOpen(!modelOpen)
                      agentsOpen && setAgentsOpen(false)
                      projectOpen && setProjectOpen(false)
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>{selectedModel}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {modelOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setModelOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 py-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[160px]">
                        {MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedModel(m)
                              setModelOpen(false)
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm transition-colors',
                              selectedModel === m
                                ? 'bg-orange-50 text-orange-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Project + media + send */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="relative hidden xs:flex flex-shrink-0">
                    <button
                      onClick={() => {
                        setProjectOpen(!projectOpen)
                        agentsOpen && setAgentsOpen(false)
                        modelOpen && setModelOpen(false)
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <span>Project</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {projectOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProjectOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 py-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[160px]">
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                            Default project
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Video */}
                  <button
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Video"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Mic */}
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send */}
                  <button
                    onClick={goToWorkspace}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors flex-shrink-0 shadow-sm"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
