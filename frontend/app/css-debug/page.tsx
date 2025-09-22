"use client"

import React, { useEffect, useState } from "react"

export default function CSSDebugPage() {
  const [cssRules, setCssRules] = useState<string[]>([])

  useEffect(() => {
    const extractCSSRules = () => {
      const rules: string[] = []
      
      try {
        const stylesheets = Array.from(document.styleSheets)
        
        stylesheets.forEach((sheet, sheetIndex) => {
          try {
            const cssRules = Array.from(sheet.cssRules || sheet.rules || [])
            
            cssRules.forEach((rule, ruleIndex) => {
              if (rule instanceof CSSStyleRule) {
                if (rule.selectorText && (
                  rule.selectorText.includes('data-theme') ||
                  rule.selectorText.includes('background') ||
                  rule.selectorText.includes('theme')
                )) {
                  rules.push(`${rule.selectorText} { background: ${rule.style.background}; background-color: ${rule.style.backgroundColor}; }`)
                }
              }
        })
          } catch (e) {
            rules.push(`Sheet ${sheetIndex}: Cross-origin or inaccessible`)
          }
        })
      } catch (e) {
        rules.push('Error accessing stylesheets')
      }
      
      setCssRules(rules)
    }

    extractCSSRules()
  }, [])

  const testCSSRule = (selector: string) => {
    const element = document.querySelector(selector)
    if (element) {
      const style = getComputedStyle(element)
      console.log(`${selector} background:`, style.background)
      console.log(`${selector} background-color:`, style.backgroundColor)
      return `${style.background} / ${style.backgroundColor}`
    }
    return 'Element not found'
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#f0f0f0' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">CSS Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">CSS Rules Found</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cssRules.map((rule, index) => (
                <div key={index} className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {rule}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Element Tests</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">HTML Element</h3>
                <p className="text-sm">{testCSSRule('html')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Body Element</h3>
                <p className="text-sm">{testCSSRule('body')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Data Theme Attribute</h3>
                <p className="text-sm">{document.documentElement.getAttribute('data-theme')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">CSS Variable --theme-background</h3>
                <p className="text-sm">{getComputedStyle(document.documentElement).getPropertyValue('--theme-background')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Force Test</h2>
          <div className="space-y-4">
            <button
              onClick={() => {
                // Create a test element with our classes
                const testDiv = document.createElement('div')
                testDiv.className = 'page--home min-h-screen'
                testDiv.style.position = 'fixed'
                testDiv.style.top = '0'
                testDiv.style.left = '0'
                testDiv.style.width = '100%'
                testDiv.style.height = '100%'
                testDiv.style.zIndex = '9999'
                testDiv.style.background = 'red'
                testDiv.innerHTML = '<div style="color: white; font-size: 24px; text-align: center; padding-top: 50px;">TEST ELEMENT - Should be red if CSS is working</div>'
                
                document.body.appendChild(testDiv)
                
                setTimeout(() => {
                  document.body.removeChild(testDiv)
                }, 3000)
              }}
              className="w-full p-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Test CSS Rule Application (3 second red overlay)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}