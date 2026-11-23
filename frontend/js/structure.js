// =========================
// STRUCTURE.JS - Client UI Enhancements
// =========================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Highlight current active navigation link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath || (currentPath.startsWith("/blog/") && href === "/dashboard")) {
            link.style.color = "#4da6ff";
            link.style.borderBottom = "2px solid #4da6ff";
            link.style.paddingBottom = "2px";
        }
    });

    // 2. Attach confirmation prompt to delete forms
    const deleteForms = document.querySelectorAll('form[action*="/delete-blog/"]');
    deleteForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
                e.preventDefault();
            }
        });
    });
});
