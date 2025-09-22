"use client"

import React, { useEffect, useState } from "react"

export default function SimpleTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addResult("Starting simple test...")
    
    // Test 1: Check if data-theme is set
    const dataTheme = document.documentElement.getAttribute('data-theme')
    addResult(`data-theme: ${dataTheme}`)
    
    // Test 2: Check CSS variable
    const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--theme-background')
    addResult(`--theme-background: ${themeBg}`)
    
    // Test 3: Check HTML background
    const htmlBg = getComputedStyle(document.documentElement).background
    addResult(`HTML background: ${htmlBg}`)
    
    // Test 4: Check body background
    const bodyBg = getComputedStyle(document.body).background
    addResult(`Body background: ${bodyBg}`)
    
    // Test 5: Force set theme and check
    addResult("Forcing clean-light theme...")
    document.documentElement.setAttribute('data-theme', 'clean-light')
    document.documentElement.style.setProperty('--theme-background', '#FAFAFA')
    document.documentElement.style.background = '#FAFAFA'
    document.body.style.background = '#FAFAFA'
    
    setTimeout(() => {
      const newHtmlBg = getComputedStyle(document.documentElement).background
      const newBodyBg = getComputedStyle(document.body).background
      addResult(`After force - HTML: ${newHtmlBg}, Body: ${newBodyBg}`)
    }, 100)
    
    // Test 6: Test Tailwind class
    addResult("Testing bg-theme-background class...")
    const testDiv = document.createElement('div')
    testDiv.className = 'bg-theme-background'
    testDiv.style.position = 'fixed'
    testDiv.style.top = '0'
    testDiv.style.left = '0'
    testDiv.style.width = '100px'
    testDiv.style.height = '100px'
    testDiv.style.zIndex = '9999'
    testDiv.style.border = '2px solid red'
    testDiv.innerHTML = 'TEST'
    
    document.body.appendChild(testDiv)
    
    setTimeout(() => {
      const testBg = getComputedStyle(testDiv).background
      addResult(`bg-theme-background class result: ${testBg}`)
      document.body.removeChild(testDiv)
    }, 100)
    
  }, [])

  const testTheme = (themeId: string, color: string) => {
    addResult(`Testing ${themeId} with color ${color}`)
    
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.style.setProperty('--theme-background', color)
    document.documentElement.style.background = color
    document.body.style.background = color
    
    setTimeout(() => {
      const htmlBg = getComputedStyle(document.documentElement).background
      const bodyBg = getComputedStyle(document.body).background
      addResult(`${themeId} result - HTML: ${htmlBg}, Body: ${bodyBg}`)
    }, 100)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
            <div className="space-y-2">
              <button
                onClick={() => testTheme('clean-light', '#FAFAFA')}
                className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Test Clean Light (#FAFAFA)
              </button>
              
              <button
                onClick={() => testTheme('modern-dark', '#0A0E12')}
                className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Test Modern Dark (#0A0E12)
              </button>
              
              <button
                onClick={() => testTheme('gold-luxury', '#0F0B05')}
                className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Test Gold Luxury (#0F0B05)
              </button>
              
              <button
                onClick={() => testTheme('vibrant-colors', '#e2ceb1')}
                className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Test Vibrant Colors (#e2ceb1)
              </button>
              
              <button
                onClick={() => testTheme('minimal', '#CFEBF7')}
                className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Test Minimal (#CFEBF7)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}