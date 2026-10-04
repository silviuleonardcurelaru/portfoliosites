document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {

    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {

  function setupSlider(sliderId,prevBtnId,nextBtnId) {
    const slider = document.getElementById(sliderId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (slider && prevBtn && nextBtn) {
      // Scrollt bei Klick um 220px (Kartenbreite + Abstand)
      nextBtn.addEventListener("click", () => {
        slider.scrollBy({ left: 220, behavior: "smooth" });
      });

      prevBtn.addEventListener("click", () => {
        slider.scrollBy({ left: -220, behavior: "smooth" });
      });
    }
  }
    setupSlider("skillsSlider1","prevBtn1","nextBtn1");
    setupSlider("skillsSlider2","prevBtn2","nextBtn2");
  });


const ngrok = require("@ngrok/ngrok");

async function forwardToApp() {
  const forwarder = await ngrok.forward({
    addr: "localhost:8085",
    authtoken_from_env: true,
    domain: "spectacle-penknife-zero.ngrok-free.dev",
  });
  console.log(`Available at: ${forwarder.url()}`);
}
