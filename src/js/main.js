// This script solve the popular problem when 100vh doesn’t fit the mobile browser screen (work with PostCSS plugin)
const customViewportCorrectionVariable = 'vh';

function setViewportProperty(doc) {
  let prevClientHeight;
  const customVar = '--' + (customViewportCorrectionVariable || 'vh');
  function handleResize() {
    let clientHeight = doc.clientHeight;
    if (clientHeight === prevClientHeight) return;
    requestAnimationFrame(function updateViewportHeight() {
      doc.style.setProperty(customVar, clientHeight * 0.01 + 'px');
      prevClientHeight = clientHeight;
    });
  }
  handleResize();
  return handleResize;
}

window.addEventListener('resize', setViewportProperty(document.documentElement));

// Place your jQuery code here.
$(function () {
  // Load SVG-sprite on IE
  svg4everybody();

  // Micromodal example init
  // MicroModal.init({
  //   disableScroll: true,
  //   awaitOpenAnimation: true,
  //   awaitCloseAnimation: true,
  // });

  console.log('DOM loaded');
});
