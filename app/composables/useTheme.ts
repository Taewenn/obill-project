import { ref } from "vue";

export const useTheme = () => {
    const theme = ref<"light" | "dark">("light");

    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark");
    };

    // Initialize theme from localStorage or system preference
    const initTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            theme.value = savedTheme as "light" | "dark";
            if (theme.value === "dark") {
                document.documentElement.classList.add("dark");
            }
        } else {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            theme.value = prefersDark ? "dark" : "light";
            if (prefersDark) {
                document.documentElement.classList.add("dark");
            }
        }
    };

    // Watch for system theme changes
    const watchSystemTheme = () => {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                if (!localStorage.getItem("theme")) {
                    theme.value = e.matches ? "dark" : "light";
                    if (e.matches) {
                        document.documentElement.classList.add("dark");
                    } else {
                        document.documentElement.classList.remove("dark");
                    }
                }
            });
    };

    return {
        theme,
        toggleTheme,
        initTheme,
        watchSystemTheme,
    };
};
