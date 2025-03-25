import { ref } from "vue";

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

export const useInvoices = () => {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase;

    // State
    const invoices = ref<Invoice[]>([]);
    const totalAmount = ref(0);
    const amountByCategory = ref<ChartData>({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
            },
        ],
    });
    const amountByDepartment = ref<ChartData>({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
            },
        ],
    });

    // Methods
    const fetchInvoices = async () => {
        try {
            const response = await fetch(`${apiBase}/invoices`);
            invoices.value = await response.json();
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    const fetchTotalAmount = async () => {
        try {
            const response = await fetch(`${apiBase}/invoices/stats/total`);
            totalAmount.value = await response.json();
        } catch (error) {
            console.error("Error fetching total amount:", error);
        }
    };

    const fetchAmountByCategory = async () => {
        try {
            const response = await fetch(
                `${apiBase}/invoices/stats/by-category`
            );
            const data = await response.json();

            amountByCategory.value = {
                labels: data.map((item: any) => item.categoryName),
                datasets: [
                    {
                        data: data.map((item: any) => item.total),
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
    };

    const fetchAmountByDepartment = async () => {
        try {
            const response = await fetch(
                `${apiBase}/invoices/stats/by-department`
            );
            const data = await response.json();

            amountByDepartment.value = {
                labels: data.map((item: any) => item.departmentName),
                datasets: [
                    {
                        data: data.map((item: any) => item.total),
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
    };

    const createInvoice = async (formData: FormData) => {
        try {
            const response = await fetch(`${apiBase}/invoices`, {
                method: "POST",
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error("Error creating invoice:", error);
            throw error;
        }
    };

    const deleteInvoice = async (id: string) => {
        try {
            await fetch(`${apiBase}/invoices/${id}`, {
                method: "DELETE",
            });
            await fetchInvoices();
        } catch (error) {
            console.error("Error deleting invoice:", error);
            throw error;
        }
    };

    return {
        invoices,
        totalAmount,
        amountByCategory,
        amountByDepartment,
        fetchInvoices,
        fetchTotalAmount,
        fetchAmountByCategory,
        fetchAmountByDepartment,
        createInvoice,
        deleteInvoice,
    };
};
