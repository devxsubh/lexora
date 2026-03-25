'use client'

import React, { useState, useEffect } from 'react'
import { Plus, GripVertical, Clock, Users, Shield, MessageSquare, FileCheck, PenTool, Zap, FileSignature, Quote, ArrowRight, CheckCircle2, Sparkles, FileText, UploadCloud, Search, Lock, Cpu, Home, List, Code, Download, Share2, AlertTriangle, Wand2, MessageCircle, MousePointer2, Brain, Check, X, Maximize2, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header-3'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroFlowVisual } from '@/components/landing/HeroFlowVisual'

const navigationItems = [
  {
    id: 'chat',
    title: 'Chat',
    icon: MessageSquare,
    description: 'Leverage any Generative AI model with a feature rich chat interface',
    visual: 'chat',
  },
  {
    id: 'review',
    title: 'Review',
    icon: FileCheck,
    description: 'Intelligent contract analysis that identifies risks and ensures compliance',
    visual: 'review',
  },
  {
    id: 'generate',
    title: 'Generate Contract',
    icon: PenTool,
    description: 'AI-powered contract generator that creates professional legal documents in seconds',
    visual: 'generate',
  },
  {
    id: 'esign',
    title: 'E-Sign',
    icon: FileSignature,
    description: 'Secure e-signature solution with workflow automation and document tracking',
    visual: 'esign',
  },
  {
    id: 'agent',
    title: 'Agent',
    icon: Zap,
    description: 'Automate contract workflows with AI agents and intelligent process automation',
    visual: 'agent',
    comingSoon: true,
  },
]

export default function LandingPage() {
  const [activeNavItem, setActiveNavItem] = useState(navigationItems[0].id)
  const [userInteracted, setUserInteracted] = useState(false)

  const activeNavItemData = navigationItems.find((item) => item.id === activeNavItem) || navigationItems[0]

  // Auto-cycle through navigation items (ONYX style)
  useEffect(() => {
    if (userInteracted) return
    const cycleInterval = setInterval(() => {
      setActiveNavItem((prev) => {
        const currentIndex = navigationItems.findIndex((item) => item.id === prev)
        const nextIndex = (currentIndex + 1) % navigationItems.length
        return navigationItems[nextIndex].id
      })
    }, 2500)
    return () => clearInterval(cycleInterval)
  }, [userInteracted])

  const handleNavClick = (itemId: string) => {
    setUserInteracted(true)
    setActiveNavItem(itemId)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Grid Background */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {/* Hero Section - 3 Grid Layout */}
          <div className="grid lg:grid-cols-12 gap-12 mb-8">
            {/* Grid 1 & 2 - Left Column (Stacked) - Wider */}
            <div className="lg:col-span-5 flex flex-col">
              {/* Grid 1: Headline + Description */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  Smarter, Faster, Automated Legal Work
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Transform your legal workflow with AI-powered contract generation, intelligent review, and seamless execution.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium"
                >
                  Start a blank document
                </Button>
              </div>

              {/* Grid 2: Navigation Items */}
              <div className="space-y-1 border-t border-gray-200 pt-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeNavItem === item.id
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors relative
                          ${isActive ? 'text-gray-900 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}
                        `}
                      >
                        {/* Vertical Orange Indicator Bar */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 rounded-r" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.title}</span>
                        {item.comingSoon && (
                          <span className="ml-auto text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </button>
                      {/* Description for active item */}
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-gray-600 px-3 py-2 leading-relaxed"
                        >
                          {item.description}
                        </motion.p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Grid 3 - Right Column: Text + Large Image Preview */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <div className="flex flex-col h-full">
                {/* Text at top - Larger, Right Aligned */}
                <div className="mb-4 text-right">
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                    An AI-driven workspace for generating, editing, and executing contracts efficiently
                  </p>
                </div>

                {/* Large Feature Visual - interactive flow (video-like) */}
                <div className="flex-1 min-h-[560px] -mr-8">
                  <div className="relative h-full min-h-[460px] overflow-visible">
                    <AnimatePresence mode="wait">
                      <HeroFlowVisual key={activeNavItem} activeNavId={activeNavItem} />
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* The Lexora Platform Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {/* Section Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
            The Lexora Platform
          </h2>

          {/* Three Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1: AI-Powered Input */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">AI-Powered</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate contracts with AI assistance. Deep research, clause suggestions, and intelligent document analysis powered by advanced language models.
              </p>
              
              {/* Input Box Showcase */}
              <div className="mt-6">
                <div 
                  className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-md"
                  style={{
                    boxShadow: '0 0 0 1px rgba(249, 115, 22, 0.1), 0 4px 12px rgba(249, 115, 22, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <GripVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Draft an employment contract..."
                      className="flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400 text-sm"
                      readOnly
                    />
                    <button className="px-3 py-1.5 bg-orange-600 text-white rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Deep Research
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Smart Editor */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Smart Editor</h3>
              <p className="text-gray-600 leading-relaxed">
                Rich text editing with real-time collaboration. Format documents, add clauses, insert variables, and manage your contracts with ease.
              </p>
              
              {/* Editor Preview */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-md h-64 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Editor Toolbar Preview */}
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                  
                  {/* Editor Content Preview */}
                  <div className="flex-1 space-y-2 text-sm text-gray-700">
                    <div className="font-semibold text-base">Employment Agreement</div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-2"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="h-2"></div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        Variable: [Company Name]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Collaborative */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Collaborative</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together seamlessly. Share documents, request signatures, track changes, and collaborate with your team in real-time.
              </p>
              
              {/* Collaboration Features Preview */}
              <div className="mt-6 space-y-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        JD
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                        <div className="text-xs text-gray-500">Editing now</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Request Signatures</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Share & Collaborate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            From idea to signed document in three simple steps.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: 1, title: 'Describe what you need', desc: 'Type a short prompt or choose a template. Our AI understands context and suggests the right structure.', icon: Sparkles },
              { step: 2, title: 'Review & customize', desc: 'Edit clauses, add variables, and get risk analysis. Collaborate with your team in real time.', icon: FileCheck },
              { step: 3, title: 'Sign & send', desc: 'Request e-signatures, track status, and store everything in one secure workspace.', icon: FileSignature },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Step {item.step}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-6 left-14 w-[calc(100%-3rem)] h-px bg-gradient-to-r from-orange-200 to-transparent -z-10" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contract lifecycle loop */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            All things contracts, in one loop
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-gray-600 max-w-2xl mx-auto mb-12"
          >
            Lexora keeps every stage connected—from first draft to final signature—so AI can
            watch the whole workflow, not just one document.
          </motion.p>

          <motion.div
            className="relative mx-auto max-w-3xl aspect-[3/2]"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {/* Soft circular rings */}
            <div className="pointer-events-none absolute inset-4 rounded-full border border-orange-100/70" />
            <div className="pointer-events-none absolute inset-10 rounded-full border border-orange-50" />

            {/* Center AI pill */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white shadow-md border border-orange-100"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror' }}
              >
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Lexora AI</span>
              </motion.div>
            </div>

            {/* Outer loop nodes */}
            <div className="absolute inset-0">
              {/* Top row: Research -> Review -> Approve */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: [0, -2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.05, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <Search className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Research
                  </span>
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: [0, -2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.18, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <FileCheck className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Review
                  </span>
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.22 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: [0, -2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <ThumbsUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Approve
                  </span>
                </motion.div>
              </div>

              {/* Right side: Approve -> Execute -> Fulfill */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: [0, 2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <FileSignature className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Execute
                  </span>
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.36 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: [0, 2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.42, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Fulfill
                  </span>
                </motion.div>
              </div>

              {/* Bottom row: Optimize <- Analyze <- Create */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: [0, 2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <Cpu className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Analyze
                  </span>
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.36 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: [0, 2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.42, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Optimize
                  </span>
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.48 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: [0, 2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.54, repeat: Infinity, repeatType: 'mirror' }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    <PenTool className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-[11px] tracking-[0.09em] uppercase text-gray-600">
                    Create
                  </span>
                </motion.div>
              </div>

              {/* Left side loop arrows + chat */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ArrowRight className="w-4 h-4 -rotate-90" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: [0, -2, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.26, repeat: Infinity, repeatType: 'mirror' }}
                  className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </motion.div>
                <motion.div
                  className="text-orange-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                >
                  <ArrowRight className="w-4 h-4 -rotate-90" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 1: A complete contract management solution */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                A complete contract management solution
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                From drafting and review to e-sign and storage—everything you need in one intelligent workspace.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              {/* Editor preview - product-style mockup */}
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden ring-1 ring-black/5">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2 font-medium">Employment Agreement — Lexora</span>
                </div>

                <div className="flex min-h-[340px]">
                  {/* Left sidebar - icons like real app */}
                  <aside className="w-16 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-5">
                    {[
                      { icon: Home, label: 'Home' },
                      { icon: List, label: 'Outline' },
                      { icon: Code, label: 'Variables' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                      </div>
                    ))}
                  </aside>

                  {/* Main content area */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Toolbar */}
                    <header className="flex-shrink-0 px-5 py-3 border-b border-gray-100 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-lg font-semibold text-gray-900 truncate">Employment Agreement</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                            <Download className="w-3.5 h-3.5" />
                            Export
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                            <FileSignature className="w-3.5 h-3.5" />
                            Request Signatures
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </span>
                        </div>
                      </div>
                    </header>

                    {/* Document body preview */}
                    <div className="flex-1 px-6 py-5 bg-gray-50/50">
                      <div className="max-w-2xl space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Executive Summary</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          This Employment Agreement is entered into between{' '}
                          <span className="relative inline-block">
                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-2.5 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-lg">
                              Variable filling
                            </span>
                            <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 z-10 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-orange-500" />
                            <span className="relative px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium ring-2 ring-orange-400 ring-offset-2 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]">
                              [Company Name]
                            </span>
                          </span>{' '}
                          and the Employee, effective as of the date of signing.
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 mt-5">Scope of Work</h3>
                        <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                          <li>Role, responsibilities, and reporting structure</li>
                          <li>Compensation, benefits, and confidentiality terms</li>
                          <li>Term, termination, and governing law</li>
                        </ul>
                        <div className="h-2" />
                        <div className="h-px bg-gray-200" />
                        <div className="flex gap-2 pt-1">
                          <span className="w-16 h-2 bg-gray-200 rounded" />
                          <span className="w-24 h-2 bg-gray-200 rounded" />
                          <span className="w-20 h-2 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: INTELLIGENCE - Risk free AI on your terms */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/20 blur-[80px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-orange-400">Intelligence</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Risk-free AI—on your terms
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                Our AI is built into every part of Lexora. It understands your context and follows your rules, all while keeping your data secure.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Search, text: 'Understands context' },
                  { icon: Shield, text: 'Follows your rules' },
                  { icon: Lock, text: 'Data stays secure' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={item.text} className="flex items-center gap-2 text-gray-300">
                      <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="order-1 lg:order-2 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-2xl">
                <div className="absolute inset-0 bg-orange-500/10 rounded-3xl blur-2xl scale-110" />
                {/* Editor mockup: same layout as real app + right-click menu visual */}
                <div className="relative rounded-2xl border border-gray-700 bg-gray-800/95 overflow-visible shadow-2xl">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    </div>
                    <span className="text-[10px] text-gray-500 ml-2">Confidentiality Agreement — Lexora</span>
                  </div>

                  <div className="flex min-h-[380px]">
                    {/* Left sidebar - same as real editor */}
                    <aside className="w-14 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-3 gap-4">
                      {[
                        { icon: Home, label: 'Home' },
                        { icon: List, label: 'Outline' },
                        { icon: Code, label: 'Variables' },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                          </div>
                          <span className="text-[9px] text-gray-500 font-medium">{label}</span>
                        </div>
                      ))}
                    </aside>

                    {/* Main: toolbar + document */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <header className="flex-shrink-0 px-4 py-2.5 border-b border-gray-700 bg-gray-800 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">Confidentiality Agreement</span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 bg-gray-700/50 rounded border border-gray-600">
                            <Download className="w-3 h-3" /> Export
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 bg-gray-700/50 rounded border border-gray-600">
                            <FileSignature className="w-3 h-3" /> Sign
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 bg-gray-700/50 rounded border border-gray-600">
                            <Share2 className="w-3 h-3" /> Share
                          </span>
                        </div>
                      </header>

                      {/* Document body: contract content + selection + right-click menu */}
                      <div className="flex-1 px-4 py-4 bg-gray-900/50 min-h-[260px] overflow-visible">
                        <div className="max-w-xl space-y-3 text-sm text-gray-300 relative">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">§ 4. Liability</h3>
                          <p className="leading-relaxed">
                            Except in the case of gross negligence or willful misconduct, neither party shall be liable for any indirect, incidental, or consequential damages. Liability shall be limited to the amount paid under this agreement in the twelve (12) months preceding the claim.
                          </p>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-1">§ 5. Confidentiality</h3>
                          <div className="leading-relaxed">
                            The Receiving Party agrees to hold all Confidential Information in strict confidence and not to disclose such information to any third party without the prior written consent of the Disclosing Party, except as may be required by law. The obligations under this section shall{' '}
                            <span className="relative inline-block align-baseline">
                              <span className="bg-blue-500/30 text-blue-100 rounded-sm px-0.5 border border-blue-400/40">
                                survive termination of this agreement for a period of five (5) years.
                              </span>
                              {/* "Right-clicked here" cursor cue - above selection */}
                              <span className="absolute left-0 -top-6 flex items-center gap-1 px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-[9px] text-gray-400 font-medium shadow-lg whitespace-nowrap z-20">
                                <MousePointer2 className="w-3 h-3 text-orange-400" />
                                Right-clicked here
                              </span>
                              {/* Context menu - appears beside selection, Cursor/VS Code style (div so not inside p) */}
                              <span className="absolute left-0 top-full mt-1 z-20 w-52 rounded-lg border border-gray-600 bg-gray-800 shadow-2xl py-1 ring-1 ring-black/20">
                                <div className="px-3 py-1.5 text-[9px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                                  AI actions
                                </div>
                                {[
                                  { icon: Wand2, label: 'Rewrite with AI', shortcut: '⌘R' },
                                  { icon: Brain, label: 'Explain clause', shortcut: '⌘E' },
                                  { icon: FileText, label: 'Generate clause', shortcut: '⌘G' },
                                  { icon: AlertTriangle, label: 'Highlight risks', shortcut: '⌘H' },
                                ].map(({ icon: Icon, label, shortcut }) => (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-orange-500/20 hover:text-orange-200 first:mt-0.5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                      {label}
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-mono">{shortcut}</span>
                                  </div>
                                ))}
                              </span>
                            </span>
                          </div>
                          <p className="leading-relaxed text-gray-500">
                            ...further clauses below...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Upload → Editor → AI Review */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Soft orange glow / band */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full bg-orange-300/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left column – copy & bullets */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6 lg:col-span-5"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Upload a contract. Reviewed in seconds.
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-md">
                Drag in any PDF or DOCX. It opens directly in the Lexora editor and our AI runs an instant review for risks and fixes.
              </p>
              <ul className="space-y-3 text-sm md:text-base">
                {[
                  'Upload any contract file',
                  'Opens in our structured editor',
                  'AI flags risks and suggests fixes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right column – product visual card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative lg:col-span-7"
            >
              <div className="relative rounded-3xl border border-gray-200 bg-white shadow-[0_22px_45px_rgba(15,23,42,0.08)] p-4 sm:p-6 lg:p-7 overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch">
                  {/* Left side – upload + editor */}
                  <div className="flex-1 space-y-4">
                    {/* Upload card */}
                    <div className="bg-white border border-dashed border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                          <UploadCloud className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Drop your NDA here or browse files
                          </p>
                          <p className="text-xs text-gray-500">
                            We&apos;ll open it directly in Lexora.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                        PDF, DOCX, HTML
                      </span>
                    </div>

                    {/* Uploading / analyzing line */}
                    <div className="flex items-center justify-between gap-3 px-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        <span>Uploading… Analyzing with AI</span>
                      </div>
                      <div className="h-1.5 w-24 rounded-full bg-orange-100 overflow-hidden">
                        <div className="h-full w-2/3 rounded-full bg-orange-500 animate-pulse" />
                      </div>
                    </div>

                    {/* Editor preview – closer to real editor */}
                    <div className="mt-1 rounded-2xl border border-gray-100 bg-white overflow-hidden relative">
                      {/* Title bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-800 truncate">
                          Acme NDA.pdf
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 h-2 rounded-full bg-gray-200" />
                          <span className="w-10 h-2 rounded-full bg-gray-200" />
                          <span className="w-6 h-2 rounded-full bg-gray-200" />
                        </div>
                      </div>

                      {/* Focus mode button (to mirror real editor) */}
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Body with highlighted clause */}
                      <div className="relative px-4 py-3 space-y-2 text-[11px] text-gray-700">
                        <p className="leading-relaxed">
                          This Non-Disclosure Agreement (&quot;Agreement&quot;) is made between Acme Inc. and Recipient. The
                          parties agree to maintain confidentiality of all shared information.
                        </p>
                        <p className="leading-relaxed">
                          In no event shall either party&apos;s liability be limited, and damages may include all indirect,
                          consequential, and special losses incurred by the other party.
                        </p>
                        <p className="leading-relaxed text-gray-500">
                          Additional standard confidentiality, governing law, and term clauses follow below.
                        </p>

                        {/* AI change block inline with content */}
                        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] text-orange-900 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Brain className="w-3.5 h-3.5 text-orange-600" />
                              AI suggestion
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[9px] text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Unlimited liability
                            </span>
                          </div>
                          <p className="text-[10px] leading-relaxed">
                            Replace this clause with: &ldquo;Liability is capped at twelve (12) months of fees and excludes
                            indirect or consequential damages.&rdquo;
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white px-2.5 py-0.5 font-semibold hover:bg-orange-600">
                              <Check className="w-3 h-3" />
                              Apply change
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white text-orange-700 px-2.5 py-0.5 font-medium hover:bg-orange-50">
                              <X className="w-3 h-3" />
                              Keep original
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side – AI Review panel */}
                  <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                    <div className="h-full rounded-2xl bg-gradient-to-b from-orange-50 via-white to-orange-50 border border-orange-100 px-4 py-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              AI Review
                            </p>
                            <p className="text-[11px] text-gray-500">
                              3 issues found · 2 suggestions
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {[
                          {
                            title: 'Unlimited liability',
                            desc: 'Liability is uncapped and includes indirect damages.',
                          },
                          {
                            title: 'Broad confidentiality carve-out',
                            desc: 'Exceptions to confidentiality are wider than standard.',
                          },
                          {
                            title: 'Missing termination for convenience',
                            desc: 'No clear right to terminate without cause.',
                          },
                        ].map((item) => (
                          <div
                            key={item.title}
                            className="flex items-start justify-between gap-3 rounded-xl bg-white/80 border border-orange-100 px-3 py-2.5"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <p className="text-[11px] font-semibold text-gray-900">
                                  {item.title}
                                </p>
                              </div>
                              <p className="text-[11px] text-gray-600">
                                {item.desc}
                              </p>
                            </div>
                            <button className="ml-2 inline-flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-semibold px-2.5 py-1 whitespace-nowrap">
                              Fix with AI
                            </button>
                          </div>
                        ))}
                      </div>

                      <button className="mt-1 self-start text-[11px] font-medium text-orange-700 hover:text-orange-800">
                        Apply all fixes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security backing */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 right-0 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-200 uppercase tracking-[0.16em]">
                <Shield className="w-3.5 h-3.5 text-orange-300" />
                Security backing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Security that protects every contract.
              </h2>
              <p className="text-sm md:text-base text-gray-300 max-w-xl">
                Lexora safeguards your contract workspace with industry-grade security, so every NDA, MSA, and signature stays confidential—without slowing your team down.
              </p>
              <div className="space-y-4 text-sm md:text-base">
                <div>
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    You control your data
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Contract data is never used to train broad AI models. Access is governed by strict, role‑based permissions so only the right people can see the right agreements.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Independently audited and certified
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Our security is continuously monitored and validated by third‑party auditors. We align to SOC 2 Type II, ISO 27001, HIPAA, and PCI best practices, backed by 24/7 security operations.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="mt-2 border-orange-400/60 text-orange-100 hover:bg-orange-500/10 hover:border-orange-300 w-auto"
              >
                Explore security features
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-6 bg-orange-500/20 blur-3xl opacity-40" />
                <div className="relative rounded-2xl border border-orange-500/30 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 shadow-2xl overflow-hidden">
                  {/* Window chrome */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-orange-500/30 bg-black/30">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                      </div>
                      <span className="text-[11px] text-gray-300">
                        NDA Workspace · Encrypted
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-400/40">
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span className="text-[10px] text-emerald-100 font-medium">
                        Zero‑trust access
                      </span>
                    </div>
                  </div>

                  <div className="flex">
                    {/* Contract preview */}
                    <div className="flex-1 border-r border-orange-500/20 bg-gray-900/60 px-4 py-4 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">
                          Acme Mutual NDA
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-300" />
                          Encrypted
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-gray-300">
                        <p className="leading-relaxed">
                          This Mutual Non‑Disclosure Agreement is entered into between Acme Inc. and Recipient to protect
                          confidential business information shared for evaluation of a potential partnership.
                        </p>
                        <p className="leading-relaxed">
                          Each party agrees to use the same degree of care as it uses with its own confidential materials,
                          and in no event less than a commercially reasonable standard of care.
                        </p>
                        <p className="leading-relaxed">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 border border-emerald-400/40 text-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Access logged &amp; encrypted
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Security summary panel */}
                    <div className="w-40 sm:w-48 bg-black/40 px-3.5 py-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-orange-300" />
                          Controls
                        </p>
                        <ul className="space-y-1.5 text-[11px] text-gray-300">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Role‑based permissions
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            SSO &amp; SCIM support
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Activity trails on every contract
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-white">Compliance</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['SOC 2', 'ISO 27001', 'HIPAA', 'PCI'].map((badge) => (
                            <span
                              key={badge}
                              className="px-1.5 py-0.5 rounded-full bg-gray-900/70 border border-gray-600/70 text-[9px] text-gray-200"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 border-t border-orange-500/20 pt-2 mt-1">
                        Real‑time monitoring, anomaly detection, and dedicated security team on call 24/7.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            Loved by legal teams
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            See what professionals say about Lexora.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'Lexora cut our contract drafting time by more than half. The AI suggestions are surprisingly accurate.', name: 'Sarah Chen', role: 'General Counsel, TechCorp', initials: 'SC', color: 'from-orange-400 to-amber-500' },
              { quote: 'We use it for NDAs and employment agreements. No more copying from old Word docs—everything is consistent and compliant.', name: 'Marcus Webb', role: 'HR Director, ScaleUp', initials: 'MW', color: 'from-violet-400 to-purple-500' },
              { quote: 'The e-sign flow and clause library are game-changers. Our vendors love how fast we turn around contracts.', name: 'Elena Rodriguez', role: 'Procurement Lead, GlobalCo', initials: 'ER', color: 'from-emerald-400 to-teal-500' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-colors"
              >
                <Quote className="w-8 h-8 text-orange-200 mb-4" />
                <p className="text-gray-700 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Ready to draft smarter?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
          >
            Join teams who are already saving hours every week with AI-powered contracts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-base font-medium inline-flex items-center gap-2"
            >
              Start a blank document
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-500 text-gray-200 hover:bg-white/10 hover:border-gray-400 px-8 py-3"
            >
              Schedule a demo
            </Button>
          </motion.div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Free tier available
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SOC 2 compliant
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
