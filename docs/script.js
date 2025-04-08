const sidebarMenu = document.getElementById("sidebarMenu");
const sidebar = document.getElementById("sidebar");
const navMenu = document.getElementById("navMenu");

navMenu.addEventListener("click", (evt) => {
	sidebar.style.transform = "translateX(-100%)";
});

sidebarMenu.addEventListener("click", (evt) => {
	sidebar.style.transform = "none";
});
