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
    const lastSlashIndex = location.pathname.lastIndexOf("/");
    if (lastSlashIndex > 0) {
        location.pathname = location.pathname.substring(0, lastSlashIndex);
    } else {
        location.pathname = "/";
    }
});

navLogo.addEventListener("click", (evt) => {
    const lastSlashIndex = location.pathname.lastIndexOf("/");
    if (lastSlashIndex > 0) {
        location.pathname = location.pathname.substring(0, lastSlashIndex);
    } else {
        location.pathname = "/";
    }
});
