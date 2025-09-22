"use client"

import React, { useEffect, useState } from "react"
import "../nuclear-fix.css"

export default function NuclearTestPage() {
  const [currentTheme, setCurrentTheme] = useState('clean-light')

  const themes = {
    'clean-light': '#FAFAFA',
    'modern-dark': '#0A0E12',
    'gold-luxury': '#0F0B05',
    'vibrant-colors': '#e2ceb1',
    'minimal': '#CFEBF7'
  }

  const applyTheme = (themeId: string) => {
    console.log(`🎨 Applying nuclear theme: ${themeId}`)
    document.documentElement.setAttribute('data-theme', themeId)
    setCurrentTheme(themeId)
  }

  useEffect(() => {
    applyTheme('clean-light')
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Nuclear CSS Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Theme Switcher</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(themes).map(([themeId, color]) => (
              <button
                key={themeId}
                onClick={() => applyTheme(themeId)}
                className={`p-4 rounded-lg font-semibold text-white ${
                  currentTheme === themeId ? 'ring-4 ring-yellow-400' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {themeId}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-semibold">Current Theme: {currentTheme}</h3>
              <p>Expected Color: {themes[currentTheme as keyof typeof themes]}</p>
              <p>Data Attribute: {document.documentElement.getAttribute('data-theme')}</p>
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="font-semibold">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click on any theme button above</li>
                <li>The entire page background should change to that theme's color</li>
                <li>Individual elements (cards, buttons) should keep their original styling</li>
                <li>Check console for any errors or conflicts</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}