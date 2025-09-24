// FIX WAITER AND NOTE MODALS - Copy and paste this into browser console
console.log('🔧 FIXING WAITER AND NOTE MODALS...');

// Clear any existing intervals
if (window.waiterNoteFixInterval) {
  clearInterval(window.waiterNoteFixInterval);
  delete window.waiterNoteFixInterval;
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

// Function to force exact colors on waiter and note modals
function fixWaiterNoteModals() {
  console.log('\n🎯 FORCING EXACT COLORS ON WAITER AND NOTE MODALS...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
  console.log('Current theme:', currentTheme);
  
  // Exact colors we want for each theme (same as food item modal)
  const exactColors = {
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
  
  const colors = exactColors[currentTheme] || exactColors['clean-light'];
  console.log('Using exact colors:', colors);
  
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
            // FORCE the exact colors with maximum specificity
            element.style.setProperty('background-color', colors.bg, 'important');
            element.style.setProperty('color', colors.text, 'important');
            element.style.setProperty('border-color', colors.border, 'important');
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
            element.style.setProperty('border', `1px solid ${colors.border}`, 'important');
            
            // Also force text color for ALL child elements
            const allChildren = element.querySelectorAll('*');
            allChildren.forEach(child => {
              child.style.setProperty('color', colors.text, 'important');
            });
            
            // Add a data attribute to mark it as fixed
            element.setAttribute('data-fixed-waiter-note-modal', 'true');
            
            fixedCount++;
            console.log(`✅ Fixed waiter/note modal ${index + 1}`);
          } else {
            console.log(`⏭️  Skipping food item modal ${index + 1}`);
          }
        }
      } catch (e) {
        console.log('Error processing element:', e.message);
      }
    });
  });
  
  console.log(`\n🎯 FORCED EXACT COLORS ON ${fixedCount} WAITER/NOTE MODALS!`);
  return fixedCount;
}

// Function to monitor theme changes and force colors immediately
function monitorAndForceWaiterNoteColors() {
  let lastTheme = document.documentElement.getAttribute('data-theme');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log(`\n🔄 THEME CHANGED: ${lastTheme} → ${newTheme}`);
        
        // Force colors immediately after theme change
        setTimeout(() => {
          console.log('\n🎯 FORCING WAITER/NOTE MODAL COLORS IMMEDIATELY AFTER THEME CHANGE...');
          fixWaiterNoteModals();
        }, 100);
        
        lastTheme = newTheme;
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  console.log('👀 Monitoring theme changes and forcing waiter/note modal colors...');
  return observer;
}

// Function to scan for waiter and note modals in real-time
function scanForWaiterNoteModals() {
  console.log('\n🔍 SCANNING FOR WAITER AND NOTE MODALS...');
  
  // Find all divs that might be waiter/note modals
  const allDivs = document.querySelectorAll('div');
  let modalCount = 0;
  
  allDivs.forEach(div => {
    try {
      const rect = div.getBoundingClientRect();
      const classes = safeGetClasses(div);
      
      // Check if it looks like a waiter/note modal
      if (rect.width > 300 && rect.width < 600 && rect.height > 200 && rect.height < 500) {
        const hasModalClasses = classes.includes('rounded-3xl') || 
                               classes.includes('shadow-2xl') || 
                               classes.includes('backdrop-blur');
        
        if (hasModalClasses) {
          modalCount++;
          console.log(`Modal ${modalCount}:`, classes);
          console.log('  Size:', rect.width, 'x', rect.height);
          console.log('  Position:', rect.left, rect.top);
          
          // Check if it's already fixed
          if (div.getAttribute('data-fixed-waiter-note-modal') === 'true') {
            console.log('  ✅ Already fixed');
          } else {
            console.log('  ⚠️  Needs fixing');
          }
        }
      }
    } catch (e) {
      // Skip problematic elements
    }
  });
  
  console.log(`Found ${modalCount} potential waiter/note modals`);
  return modalCount;
}

// Run the fix
console.log('🚀 Starting waiter and note modal fix...');

// 1. Force exact colors immediately
fixWaiterNoteModals();

// 2. Scan for modals
scanForWaiterNoteModals();

// 3. Monitor theme changes and force colors
const themeObserver = monitorAndForceWaiterNoteColors();

// 4. Run periodic scans and force colors
window.waiterNoteFixInterval = setInterval(() => {
  console.log('\n⏰ PERIODIC WAITER/NOTE MODAL SCAN...');
  fixWaiterNoteModals();
  scanForWaiterNoteModals();
}, 1000); // Check every second

console.log('\n💡 WAITER AND NOTE MODAL FIX ACTIVE:');
console.log('1. Exact colors are being forced on waiter and note modals');
console.log('2. Theme changes are being monitored');
console.log('3. Colors are forced immediately on theme changes');
console.log('4. Periodic scans every 1 second');
console.log('5. Open a waiter call or note modal and switch themes to test');

// Store references for cleanup
window.waiterNoteFixObserver = themeObserver;

// Also run a one-time deep scan after 2 seconds
setTimeout(() => {
  console.log('\n🔍 RUNNING DEEP WAITER/NOTE MODAL SCAN AFTER 2 SECONDS...');
  fixWaiterNoteModals();
  scanForWaiterNoteModals();
}, 2000);