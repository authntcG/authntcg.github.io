// Bootstrap Auto Theme
(function () {
    const htmlElement = document.querySelector("html")
    if (htmlElement.getAttribute("data-bs-theme") === 'auto') {
        function updateTheme() {
            document.querySelector("html").setAttribute("data-bs-theme",
                window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
        updateTheme()
    }
})();

// Function to hide preload page
function hidePreload() {
    document.getElementById('preload').classList.add('preload-hidden');
}

function animateProgressBar() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += 1;
            loadingBar.value = progress;
        } else {
            clearInterval(interval);
        }
    }, 15); // Adjust the interval to control the speed
}

// Loading animation sections
window.addEventListener('load', hidePreload);
document.onreadystatechange = function () {
    const loadingBar = document.getElementById('loading-bar');
    if (document.readyState === 'interactive') {
        animateProgressBar();
    } else if (document.readyState === 'complete') {
        loadingBar.value = 100;
        hidePreload();
    }
};
