// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss", "nuxt-icon", "@nuxt/image", "shadcn-nuxt"],
    app: {
        head: {
            title: "OBill - Invoice Management System",
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "description",
                    content:
                        "Modern invoice management system with OCR capabilities",
                },
            ],
        },
    },
    runtimeConfig: {
        public: {
            apiBase: process.env.API_BASE || "http://localhost:8000",
        },
    },
    shadcn: {
        /**
         * Prefix for all the imported component
         */
        prefix: "",
        /**
         * Directory that the component lives in.
         * @default "./components/ui"
         */
        componentDir: "./components/ui",
    },
});
