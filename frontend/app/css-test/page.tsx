"use client"

import React, { useEffect, useState } from "react"

export default function CSSTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const runTest = () => {
      console.log("=== CSS TEST ===")
      
      // Check data-theme attribute
      const dataTheme = document.documentElement.getAttribute('data-theme')
      console.log("data-theme:", dataTheme)
      
      // Check computed styles
      const htmlStyle = getComputedStyle(document.documentElement)
      const bodyStyle = getComputedStyle(document.body)
      
      console.log("HTML background:", htmlStyle.background)
      console.log("Body background:", bodyStyle.background)
      console.log("--theme-background:", htmlStyle.getPropertyValue('--theme-background'))
      
      // Check if our CSS rules are being applied
      const testElement = document.createElement('div')
      testElement.className = 'page--home min-h-screen'
      testElement.style.display = 'none'
      document.body.appendChild(testElement)
      
      const testStyle = getComputedStyle(testElement)
      console.log("Test element background:", testStyle.background)
      
      document.body.removeChild(testElement)
      
      setDebugInfo({
        dataTheme,
        htmlBackground: htmlStyle.background,
        bodyBackground: bodyStyle.background,
        themeBackground: htmlStyle.getPropertyValue('--theme-background'),
        testElementBackground: testStyle.background
      })
    }
    
    runTest()
    
    // Test theme switching
    const testThemes = ['clean-light', 'modern-dark', 'minimal']
    let index = 0
    
    const interval = setInterval(() => {
      if (index < testThemes.length) {
        const theme = testThemes[index]
        console.log(`\n=== Testing ${theme} ===`)
        
        // Set data-theme
        document.documentElement.setAttribute('data-theme', theme)
        
        // Force background
        const colors = {
          'clean-light': '#FAFAFA',
          'modern-dark': '#0A0E12',
          'minimal': '#CFEBF7'
        }
        
        const bgColor = colors[theme as keyof typeof colors]
        document.documentElement.style.background = bgColor
        document.body.style.background = bgColor
        
        setTimeout(() => {
          runTest()
        }, 500)
        
        index++
      } else {
        clearInterval(interval)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen p-8" style={{ background: '#f0f0f0' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">CSS Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser console to see test results</li>
            <li>Watch the page automatically cycle through themes</li>
            <li>Check if the background color changes</li>
            <li>Look for CSS rule conflicts in the console</li>
          </ol>
        </div>
      </div>
    </div>
  )
}