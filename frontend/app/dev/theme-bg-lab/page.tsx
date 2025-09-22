"use client";

import React from "react";

export default function ThemeBgLab() {
  const pageUrls = ["/", "/menu"];
  
  return (
    <div className="min-h-screen bg-theme-background p-6 space-y-4">
      <h1 className="text-2xl font-bold text-theme-text-primary">Theme BG Lab</h1>
      <p className="text-theme-text-secondary">
        Below are live iframes for Homepage and Menu. Toggle themes and verify backgrounds are identical.
      </p>
      
      <div className="bg-surface-sub p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-theme-text-primary">Debug Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-theme-text-secondary">
          <li>Open DevTools for each iframe</li>
          <li>Run: <code className="bg-theme-input px-1 rounded">getComputedStyle(document.documentElement).getPropertyValue('--theme-background')</code></li>
          <li>Run: <code className="bg-theme-input px-1 rounded">getComputedStyle(document.body).background</code></li>
          <li>Run: <code className="bg-theme-input px-1 rounded">getComputedStyle(document.querySelector('.page--home, .page--menu') || document.body).background</code></li>
          <li>Values should be identical across both pages for each theme</li>
        </ol>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {pageUrls.map(url => (
          <div key={url} className="rounded-xl overflow-hidden border border-theme-border surface-sub">
            <div className="px-3 py-2 text-sm opacity-80 text-theme-text-muted bg-theme-input">
              {url}
            </div>
            <iframe 
              src={url} 
              className="w-full h-[70vh] bg-theme-background" 
              title={`${url} page`}
            />
          </div>
        ))}
      </div>
      
      <div className="bg-surface-sub p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-theme-text-primary">Expected Results:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-theme-text-secondary">
          <li><strong>Clean Light:</strong> Both pages should show #FAFAFA background</li>
          <li><strong>Modern Dark:</strong> Both pages should show #0A0E12 background</li>
          <li><strong>Gold Luxury:</strong> Both pages should show #2C1810 background</li>
          <li><strong>Vibrant Colors:</strong> Both pages should show #F8FAFC background</li>
          <li><strong>Minimal:</strong> Both pages should show #FFFFFF background</li>
        </ul>
      </div>
    </div>
  );
}