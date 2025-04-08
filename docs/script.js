// Constant Definitions
const sidebarMenu = document.getElementById("sidebarMenu");
const sidebar = document.getElementById("sidebar");
const navMenu = document.getElementById("navMenu");

// Event Listener Definitions
try {
	navMenu.addEventListener("click", (evt) => {
		sidebar.style.transform = "translateX(calc(-100% + 5px)";
	});

	sidebarMenu.addEventListener("click", (evt) => {
		sidebar.style.transform = "none";
	});
} catch (e) {
	// suppress errors
	// console.error(e);
}