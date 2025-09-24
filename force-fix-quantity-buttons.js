// FORCE FIX QUANTITY BUTTONS - Copy and paste this into browser console
console.log('🚀 FORCE FIXING QUANTITY BUTTONS...');

// Add CSS directly to the page
const style = document.createElement('style');
style.textContent = `
  /* FORCE FIX FOR QUANTITY BUTTONS */
  button[class*="rounded-full"][class*="w-12"][class*="h-12"],
  button.quantity-btn,
  .quantity-btn {
    background-color: #E8B4A0 !important;
    color: #0A0E12 !important;
    border: 1px solid #334155 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    width: 48px !important;
    height: 48px !important;
    font-size: 18px !important;
    font-weight: bold !important;
  }
  
  /* Fix cart badges */
  .absolute.-top-2.-right-2 {
    background-color: #E8B4A0 !important;
    color: #0A0E12 !important;
    border-radius: 50% !important;
  }
  
  /* Fix any child elements */
  button[class*="rounded-full"] *,
  button.quantity-btn * {
    color: #0A0E12 !important;
  }
`;
document.head.appendChild(style);

// Also force style each button individually
function forceFixButtons() {
  const buttons = document.querySelectorAll('button');
  let fixed = 0;
  
  buttons.forEach(button => {
    const classes = button.className || '';
    if (classes.includes('rounded-full') && classes.includes('w-12') && classes.includes('h-12')) {
      console.log('🔧 Force fixing button:', button);
      button.style.cssText = `
        background-color: #E8B4A0 !important;
        color: #0A0E12 !important;
        border: 1px solid #334155 !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        width: 48px !important;
        height: 48px !important;
        font-size: 18px !important;
        font-weight: bold !important;
      `;
      
      // Fix child elements
      const children = button.querySelectorAll('*');
      children.forEach(child => {
        child.style.color = '#0A0E12 !important';
      });
      
      fixed++;
    }
  });
  
  console.log(`✅ Fixed ${fixed} buttons!`);
  return fixed;
}

// Run immediately
let fixed = forceFixButtons();

// Keep trying every second for 10 seconds
let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  const newFixed = forceFixButtons();
  if (newFixed > 0) {
    console.log(`🔄 Attempt ${attempts}: Fixed ${newFixed} more buttons`);
  }
  
  if (attempts >= 10) {
    clearInterval(interval);
    console.log('🏁 Finished fixing buttons');
  }
}, 1000);

console.log('🎯 FORCE FIX COMPLETE - Check your buttons now!');