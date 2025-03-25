import { defineStore } from "pinia";

interface Category {
    id: string;
    name: string;
}

export const useCategoriesStore = defineStore("categories", {
    state: () => ({
        categories: [] as Category[],
    }),

    actions: {
        async fetchCategories() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/categories`);
                this.categories = await response.json();
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },

        async createCategory(name: string) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/categories`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name }),
                });
                const newCategory = await response.json();
                this.categories.push(newCategory);
                return newCategory;
            } catch (error) {
                console.error("Error creating category:", error);
                throw error;
            }
        },

        async deleteCategory(id: string) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                await fetch(`${apiBase}/categories/${id}`, {
                    method: "DELETE",
                });
                this.categories = this.categories.filter(
                    (category: Category) => category.id !== id
                );
            } catch (error) {
                console.error("Error deleting category:", error);
                throw error;
            }
        },
    },
});
