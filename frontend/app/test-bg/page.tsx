"use client"

import React, { useEffect, useState } from "react"

export default function TestBackgroundPage() {
  const [currentTheme, setCurrentTheme] = useState('clean-light')

  const themes = {
    'clean-light': '#FAFAFA',
    'modern-dark': '#0A0E12',
    'gold-luxury': '#0F0B05',
    'vibrant-colors': '#e2ceb1',
    'minimal': '#CFEBF7'
  }

  const applyTheme = (themeId: string) => {
    const bgColor = themes[themeId as keyof typeof themes]
    
    // NUCLEAR OPTION: Direct DOM manipulation
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.style.background = bgColor
    document.body.style.background = bgColor
    
    // Force on all possible elements
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        if (el.classList.contains('min-h-screen') || el.classList.contains('page--home') || el.classList.contains('page--menu')) {
          el.style.background = bgColor
        }
      }
    })
    
    setCurrentTheme(themeId)
    console.log(`🚀 DIRECT THEME APPLIED: ${themeId} -> ${bgColor}`)
  }

  useEffect(() => {
    applyTheme('clean-light')
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: themes[currentTheme as keyof typeof themes] }}>
      <h1 className="text-4xl font-bold mb-8 text-center">Direct Background Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(themes).map(([id, color]) => (
          <button
            key={id}
            onClick={() => applyTheme(id)}
            className={`p-4 rounded-lg text-white font-semibold ${
              currentTheme === id ? 'ring-4 ring-yellow-400' : ''
            }`}
            style={{ backgroundColor: color }}
          >
            {id}
          </button>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-4">Current State</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Theme:</strong> {currentTheme}</p>
          <p><strong>Background Color:</strong> {themes[currentTheme as keyof typeof themes]}</p>
          <p><strong>HTML data-theme:</strong> {document.documentElement.getAttribute('data-theme')}</p>
          <p><strong>HTML background:</strong> {getComputedStyle(document.documentElement).background}</p>
          <p><strong>Body background:</strong> {getComputedStyle(document.body).background}</p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-lg mb-4">This page directly sets background colors without any theme system interference.</p>
        <p className="text-sm text-gray-600">If this works, the issue is in the theme system. If this doesn't work, there's a deeper CSS conflict.</p>
      </div>
    </div>
  )
}