"use client"

import React, { useEffect, useState } from "react"

export default function FinalFixPage() {
  const [currentTheme, setCurrentTheme] = useState('clean-light')
  const [isFixed, setIsFixed] = useState(false)

  const themes = {
    'clean-light': '#FAFAFA',
    'modern-dark': '#0A0E12',
    'gold-luxury': '#0F0B05',
    'vibrant-colors': '#e2ceb1',
    'minimal': '#CFEBF7'
  }

  const applyTheme = (themeId: string) => {
    const color = themes[themeId as keyof typeof themes]
    
    console.log(`🎨 Applying theme: ${themeId} with color: ${color}`)
    
    // Method 1: Set data-theme attribute
    document.documentElement.setAttribute('data-theme', themeId)
    
    // Method 2: Set CSS variable
    document.documentElement.style.setProperty('--theme-background', color)
    
    // Method 3: Force background on html and body
    document.documentElement.style.background = color
    document.body.style.background = color
    
    // Method 4: Force background on all possible elements
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Only apply to main page elements, not individual UI components
        if (el.classList.contains('min-h-screen') && 
            (el.classList.contains('page--home') || el.classList.contains('page--menu'))) {
          el.style.background = color
          el.style.backgroundColor = color
        }
      }
    })
    
    // Method 5: Add inline style to body
    document.body.setAttribute('style', `background: ${color} !important; background-color: ${color} !important;`)
    
    // Method 6: Add CSS rule dynamically
    const styleId = 'theme-fix-style'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = `
      html, body {
        background: ${color} !important;
        background-color: ${color} !important;
      }
      .page--home .min-h-screen,
      .page--menu .min-h-screen {
        background: ${color} !important;
        background-color: ${color} !important;
      }
    `
    
    setCurrentTheme(themeId)
    setIsFixed(true)
    
    console.log(`✅ Theme ${themeId} applied with color ${color}`)
  }

  useEffect(() => {
    // Apply initial theme
    applyTheme('clean-light')
  }, [])

  const testAllThemes = () => {
    const themeIds = Object.keys(themes)
    let index = 0
    
    const interval = setInterval(() => {
      if (index < themeIds.length) {
        const themeId = themeIds[index]
        console.log(`\n🔄 Testing theme ${index + 1}/${themeIds.length}: ${themeId}`)
        applyTheme(themeId)
        index++
      } else {
        clearInterval(interval)
        console.log('✅ All themes tested!')
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen p-8" style={{ background: themes[currentTheme as keyof typeof themes] }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Final Theme Fix</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Theme</h2>
            <div className="space-y-2">
              <p><strong>Theme:</strong> {currentTheme}</p>
              <p><strong>Color:</strong> {themes[currentTheme as keyof typeof themes]}</p>
              <p><strong>Status:</strong> {isFixed ? '✅ Fixed' : '❌ Not Fixed'}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Theme Controls</h2>
            <div className="space-y-2">
              {Object.entries(themes).map(([themeId, color]) => (
                <button
                  key={themeId}
                  onClick={() => applyTheme(themeId)}
                  className={`w-full p-3 rounded-lg font-semibold ${
                    currentTheme === themeId ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {themeId} ({color})
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testAllThemes}
              className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              Test All Themes (Auto-cycle through all themes)
            </button>
            
            <button
              onClick={() => {
                console.log('🔍 Current state:')
                console.log('data-theme:', document.documentElement.getAttribute('data-theme'))
                console.log('--theme-background:', getComputedStyle(document.documentElement).getPropertyValue('--theme-background'))
                console.log('html background:', getComputedStyle(document.documentElement).background)
                console.log('body background:', getComputedStyle(document.body).background)
              }}
              className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              Log Current State to Console
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click on any theme button to test that specific theme</li>
            <li>Click "Test All Themes" to automatically cycle through all themes</li>
            <li>Check the browser console for detailed logging</li>
            <li>Verify that the page background changes to match the selected theme</li>
            <li>If this works, the issue is in the main theme system</li>
            <li>If this doesn't work, there's a deeper CSS conflict</li>
          </ol>
        </div>
      </div>
    </div>
  )
}