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

const ngrok = require("@ngrok/ngrok");

async function forwardToApp() {
  const forwarder = await ngrok.forward({
    addr: "localhost:8085",
    authtoken_from_env: true,
    domain: "spectacle-penknife-zero.ngrok-free.dev",
  });
  console.log(`Available at: ${forwarder.url()}`);
}
