const sidebarMenu = document.getElementById("sidebarMenu");
const sidebar = document.getElementById("sidebar");
const navMenu = document.getElementById("navMenu");
const navText = document.getElementById("navText");
const navLogo = document.getElementById("navLogo");

navMenu.addEventListener("click", (evt) => {
	sidebar.style.transform = "translateX(calc(-100% + 5px)";
});

sidebarMenu.addEventListener("click", (evt) => {
	sidebar.style.transform = "none";
});

navText.addEventListener("click", (evt) => {
    location.pathname = "/";
});

navLogo.addEventListener("click", (evt) => {
    location.pathname = "/";
});