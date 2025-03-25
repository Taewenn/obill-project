import { defineStore } from "pinia";

interface Invoice {
    id: string;
    fileName: string;
    amount: number;
    date: string;
    category?: {
        name: string;
    };
    department?: {
        name: string;
    };
}

interface ChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
    }[];
}

export const useInvoicesStore = defineStore("invoices", {
    state: () => ({
        invoices: [] as Invoice[],
        totalAmount: 0,
        amountByCategory: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                },
            ],
        } as ChartData,
        amountByDepartment: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                },
            ],
        } as ChartData,
    }),

    actions: {
        async fetchInvoices() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/invoices`);
                this.invoices = await response.json();
            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        },

        async fetchTotalAmount() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/invoices/stats/total`);
                this.totalAmount = await response.json();
            } catch (error) {
                console.error("Error fetching total amount:", error);
            }
        },

        async fetchAmountByCategory() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(
                    `${apiBase}/invoices/stats/by-category`
                );
                const data = await response.json();

                this.amountByCategory = {
                    labels: data.map(
                        (item: { categoryName: string; total: number }) =>
                            item.categoryName
                    ),
                    datasets: [
                        {
                            data: data.map(
                                (item: {
                                    categoryName: string;
                                    total: number;
                                }) => item.total
                            ),
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                                "#9966FF",
                                "#FF9F40",
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                            ],
                        },
                    ],
                };
            } catch (error) {
                console.error("Error fetching amount by category:", error);
            }
        },

        async fetchAmountByDepartment() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(
                    `${apiBase}/invoices/stats/by-department`
                );
                const data = await response.json();

                this.amountByDepartment = {
                    labels: data.map(
                        (item: { departmentName: string; total: number }) =>
                            item.departmentName
                    ),
                    datasets: [
                        {
                            data: data.map(
                                (item: {
                                    departmentName: string;
                                    total: number;
                                }) => item.total
                            ),
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                                "#9966FF",
                                "#FF9F40",
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                            ],
                        },
                    ],
                };
            } catch (error) {
                console.error("Error fetching amount by department:", error);
            }
        },

        async createInvoice(formData: FormData) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/invoices`, {
                    method: "POST",
                    body: formData,
                });
                return await response.json();
            } catch (error) {
                console.error("Error creating invoice:", error);
                throw error;
            }
        },

        async deleteInvoice(id: string) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                await fetch(`${apiBase}/invoices/${id}`, {
                    method: "DELETE",
                });
                await this.fetchInvoices();
            } catch (error) {
                console.error("Error deleting invoice:", error);
                throw error;
            }
        },
    },
});
