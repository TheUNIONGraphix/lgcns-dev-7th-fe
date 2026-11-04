const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

var aboutClick = document.querySelector("#about-click");
if (aboutClick) {
  aboutClick.addEventListener("click", function () {
    console.log("Click me");
  });
}

if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.hidden = isOpen;
  });
}
