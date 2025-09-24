// FIX WAITER AND NOTE MODALS COMPLETE - Copy and paste this into browser console
console.log('🔧 FIXING WAITER AND NOTE MODALS COMPLETE...');

// Clear any existing intervals
if (window.waiterNoteCompleteFixInterval) {
  clearInterval(window.waiterNoteCompleteFixInterval);
  delete window.waiterNoteCompleteFixInterval;
}

// Function to safely get element classes
function safeGetClasses(element) {
  try {
    if (element.className && typeof element.className === 'string') {
      return element.className;
    } else if (element.className && element.className.baseVal) {
      return element.className.baseVal;
    } else {
      return element.tagName || 'unknown';
    }
  } catch (e) {
    return 'error';
  }
}

// Function to fix waiter and note modals completely
function fixWaiterNoteModalsComplete() {
  console.log('\n🎯 FIXING WAITER AND NOTE MODALS COMPLETE...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
  console.log('Current theme:', currentTheme);
  
  // Colors for modal cards (solid backgrounds)
  const modalColors = {
    'clean-light': { 
      bg: '#FAFAFA', 
      text: '#3B3B3B',
      border: '#EDEDED'
    },
    'modern-dark': { 
      bg: '#0A0E12', 
      text: '#F8FAFC',
      border: '#334155'
    },
    'gold-luxury': { 
      bg: '#0F0B05', 
      text: '#FFF8DC',
      border: '#CD853F'
    },
    'vibrant-colors': { 
      bg: '#e2ceb1', 
      text: '#1E293B',
      border: '#E8E0D5'
    },
    'minimal': { 
      bg: '#CFEBF7', 
      text: '#1A202C',
      border: '#E2E8F0'
    }
  };
  
  // Colors for icons and buttons (different from modal background)
  const iconButtonColors = {
    'clean-light': { 
      iconBg: '#E7CBA9', // Primary color for icon background
      iconText: '#3B3B3B', // Dark text for icon
      buttonBg: '#EFC7B1', // Secondary color for buttons
      buttonText: '#3B3B3B', // Dark text for buttons
      buttonHover: '#D4B89A' // Hover color for buttons
    },
    'modern-dark': { 
      iconBg: '#F0C6B1', // Primary color for icon background
      iconText: '#0A0E12', // Dark text for icon
      buttonBg: '#E8B4A0', // Secondary color for buttons
      buttonText: '#0A0E12', // Dark text for buttons
      buttonHover: '#F0C6B1' // Hover color for buttons
    },
    'gold-luxury': { 
      iconBg: '#FFD700', // Gold for icon background
      iconText: '#0F0B05', // Dark text for icon
      buttonBg: '#FFF8DC', // Light gold for buttons
      buttonText: '#0F0B05', // Dark text for buttons
      buttonHover: '#FFD700' // Hover color for buttons
    },
    'vibrant-colors': { 
      iconBg: '#FF6B6B', // Coral for icon background
      iconText: '#1E293B', // Dark text for icon
      buttonBg: '#6b5e4f', // Brown for buttons
      buttonText: '#1E293B', // Dark text for buttons
      buttonHover: '#FF5252' // Hover color for buttons
    },
    'minimal': { 
      iconBg: '#2D3748', // Dark gray for icon background
      iconText: '#CFEBF7', // Light text for icon
      buttonBg: '#4A5568', // Medium gray for buttons
      buttonText: '#CFEBF7', // Light text for buttons
      buttonHover: '#1A202C' // Hover color for buttons
    }
  };
  
  const modalColor = modalColors[currentTheme] || modalColors['clean-light'];
  const iconButtonColor = iconButtonColors[currentTheme] || iconButtonColors['clean-light'];
  
  console.log('Using modal colors:', modalColor);
  console.log('Using icon/button colors:', iconButtonColor);
  
  let fixedCount = 0;
  
  // Find ALL possible waiter and note modal elements
  const allSelectors = [
    // Modal card selectors
    '.rounded-3xl.shadow-2xl',
    '.backdrop-blur-lg.rounded-3xl.shadow-2xl',
    'div[class*="rounded-3xl"][class*="shadow-2xl"]',
    'div[class*="backdrop-blur"][class*="rounded-3xl"]',
    
    // More specific selectors for modals
    'div[class*="fixed"][class*="inset-0"] div[class*="rounded-3xl"]',
    'div[class*="z-50"] div[class*="rounded-3xl"]',
    'div[class*="flex"][class*="items-center"][class*="justify-center"] div[class*="rounded-3xl"]',
    
    // Catch any modal-like elements
    'div[class*="rounded-3xl"][class*="shadow"]',
    'div[class*="backdrop-blur"][class*="rounded"]'
  ];
  
  allSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Checking selector "${selector}": found ${elements.length} elements`);
    
    elements.forEach((element, index) => {
      try {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        // Check if it's a modal card (reasonable size for waiter/note modals)
        const isModalCard = isVisible && rect.width > 300 && rect.width < 600 && rect.height > 200 && rect.height < 500;
        
        if (isModalCard) {
          console.log(`Found modal card ${index + 1}:`, element);
          console.log('Element classes:', safeGetClasses(element));
          console.log('Element size:', rect.width, 'x', rect.height);
          console.log('Element position:', rect.left, rect.top);
          
          // Check if it's already a food item modal (skip those)
          const isFoodModal = safeGetClasses(element).includes('surface') || 
                             safeGetClasses(element).includes('relative');
          
          if (!isFoodModal) {
            console.log(`  Processing waiter/note modal ${index + 1}...`);
            
            // 1. FIX MODAL CARD BACKGROUND (solid, not transparent)
            element.style.setProperty('background-color', modalColor.bg, 'important');
            element.style.setProperty('color', modalColor.text, 'important');
            element.style.setProperty('border-color', modalColor.border, 'important');
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
            element.style.setProperty('border', `1px solid ${modalColor.border}`, 'important');
            
            // Also force text color for ALL child elements
            const allChildren = element.querySelectorAll('*');
            allChildren.forEach(child => {
              child.style.setProperty('color', modalColor.text, 'important');
            });
            
            // 2. FIX CIRCULAR ICON BACKGROUNDS
            const iconSelectors = [
              'div[class*="rounded-full"]',
              'div[class*="w-16"][class*="h-16"]',
              'div[class*="w-20"][class*="h-20"]',
              'div[class*="w-24"][class*="h-24"]',
              'div[class*="mx-auto"][class*="rounded-full"]'
            ];
            
            iconSelectors.forEach(iconSelector => {
              const icons = element.querySelectorAll(iconSelector);
              icons.forEach((icon, iconIndex) => {
                const iconRect = icon.getBoundingClientRect();
                // Check if it's a circular icon (roughly square and reasonable size)
                if (iconRect.width > 40 && iconRect.width < 100 && 
                    iconRect.height > 40 && iconRect.height < 100 &&
                    Math.abs(iconRect.width - iconRect.height) < 10) {
                  
                  console.log(`    Found circular icon ${iconIndex + 1}:`, safeGetClasses(icon));
                  
                  // Apply icon background and text colors
                  icon.style.setProperty('background-color', iconButtonColor.iconBg, 'important');
                  icon.style.setProperty('color', iconButtonColor.iconText, 'important');
                  icon.style.setProperty('border-radius', '50%', 'important');
                  icon.style.setProperty('display', 'flex', 'important');
                  icon.style.setProperty('align-items', 'center', 'important');
                  icon.style.setProperty('justify-content', 'center', 'important');
                  icon.style.setProperty('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)', 'important');
                  
                  // Fix any SVG or icon elements inside
                  const svgElements = icon.querySelectorAll('svg, i, [class*="icon"]');
                  svgElements.forEach(svg => {
                    svg.style.setProperty('color', iconButtonColor.iconText, 'important');
                  });
                  
                  console.log(`    ✅ Fixed circular icon ${iconIndex + 1}`);
                }
              });
            });
            
            // 3. FIX BUTTONS
            const buttonSelectors = [
              'button',
              '[role="button"]',
              'div[class*="cursor-pointer"]',
              'div[class*="hover:"]',
              'a[class*="button"]'
            ];
            
            buttonSelectors.forEach(buttonSelector => {
              const buttons = element.querySelectorAll(buttonSelector);
              buttons.forEach((button, buttonIndex) => {
                const buttonRect = button.getBoundingClientRect();
                // Check if it's a reasonable button size
                if (buttonRect.width > 50 && buttonRect.width < 200 && 
                    buttonRect.height > 30 && buttonRect.height < 60) {
                  
                  console.log(`    Found button ${buttonIndex + 1}:`, safeGetClasses(button));
                  
                  // Apply button background and text colors
                  button.style.setProperty('background-color', iconButtonColor.buttonBg, 'important');
                  button.style.setProperty('color', iconButtonColor.buttonText, 'important');
                  button.style.setProperty('border', `1px solid ${iconButtonColor.buttonBg}`, 'important');
                  button.style.setProperty('border-radius', '8px', 'important');
                  button.style.setProperty('padding', '8px 16px', 'important');
                  button.style.setProperty('font-weight', '500', 'important');
                  button.style.setProperty('transition', 'all 0.2s ease', 'important');
                  button.style.setProperty('cursor', 'pointer', 'important');
                  
                  // Add hover effect
                  button.addEventListener('mouseenter', () => {
                    button.style.setProperty('background-color', iconButtonColor.buttonHover, 'important');
                  });
                  button.addEventListener('mouseleave', () => {
                    button.style.setProperty('background-color', iconButtonColor.buttonBg, 'important');
                  });
                  
                  console.log(`    ✅ Fixed button ${buttonIndex + 1}`);
                }
              });
            });
            
            // 4. FIX ANY OTHER INTERACTIVE ELEMENTS
            const interactiveSelectors = [
              'div[class*="hover:"]',
              'div[class*="cursor-pointer"]',
              'div[class*="clickable"]'
            ];
            
            interactiveSelectors.forEach(interactiveSelector => {
              const interactiveElements = element.querySelectorAll(interactiveSelector);
              interactiveElements.forEach((interactiveElement, elementIndex) => {
                const elementRect = interactiveElement.getBoundingClientRect();
                // Check if it's a reasonable interactive element size
                if (elementRect.width > 30 && elementRect.width < 300 && 
                    elementRect.height > 20 && elementRect.height < 80) {
                  
                  console.log(`    Found interactive element ${elementIndex + 1}:`, safeGetClasses(interactiveElement));
                  
                  // Apply subtle background and text colors
                  interactiveElement.style.setProperty('background-color', iconButtonColor.buttonBg, 'important');
                  interactiveElement.style.setProperty('color', iconButtonColor.buttonText, 'important');
                  interactiveElement.style.setProperty('border-radius', '6px', 'important');
                  interactiveElement.style.setProperty('padding', '4px 8px', 'important');
                  interactiveElement.style.setProperty('transition', 'all 0.2s ease', 'important');
                  
                  console.log(`    ✅ Fixed interactive element ${elementIndex + 1}`);
                }
              });
            });
            
            // Add a data attribute to mark it as fixed
            element.setAttribute('data-fixed-waiter-note-modal-complete', 'true');
            
            fixedCount++;
            console.log(`  ✅ Fixed waiter/note modal ${index + 1} completely`);
          } else {
            console.log(`  ⏭️  Skipping food item modal ${index + 1}`);
          }
        }
      } catch (e) {
        console.log('Error processing element:', e.message);
      }
    });
  });
  
  console.log(`\n🎯 FIXED ${fixedCount} WAITER/NOTE MODALS COMPLETELY!`);
  return fixedCount;
}

// Function to monitor theme changes and fix everything immediately
function monitorAndFixWaiterNoteComplete() {
  let lastTheme = document.documentElement.getAttribute('data-theme');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log(`\n🔄 THEME CHANGED: ${lastTheme} → ${newTheme}`);
        
        // Fix everything immediately after theme change
        setTimeout(() => {
          console.log('\n🎯 FIXING WAITER/NOTE MODALS COMPLETELY AFTER THEME CHANGE...');
          fixWaiterNoteModalsComplete();
        }, 100);
        
        lastTheme = newTheme;
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  console.log('👀 Monitoring theme changes and fixing everything...');
  return observer;
}

// Run the complete fix
console.log('🚀 Starting waiter and note modal complete fix...');

// 1. Fix everything immediately
fixWaiterNoteModalsComplete();

// 2. Monitor theme changes and fix everything
const themeObserver = monitorAndFixWaiterNoteComplete();

// 3. Run periodic scans and fix everything
window.waiterNoteCompleteFixInterval = setInterval(() => {
  console.log('\n⏰ PERIODIC COMPLETE FIX...');
  fixWaiterNoteModalsComplete();
}, 1000); // Check every second

console.log('\n💡 WAITER AND NOTE MODAL COMPLETE FIX ACTIVE:');
console.log('1. Modal cards get solid theme-appropriate backgrounds');
console.log('2. Icons get theme-appropriate background colors');
console.log('3. Buttons get theme-appropriate background and text colors');
console.log('4. Hover effects are applied to buttons');
console.log('5. Theme changes are being monitored');
console.log('6. Periodic scans every 1 second');
console.log('7. Open a waiter call or note modal to see the complete effects');

// Store references for cleanup
window.waiterNoteCompleteFixObserver = themeObserver;

// Also run a one-time deep scan after 2 seconds
setTimeout(() => {
  console.log('\n🔍 RUNNING DEEP COMPLETE FIX SCAN AFTER 2 SECONDS...');
  fixWaiterNoteModalsComplete();
}, 2000);