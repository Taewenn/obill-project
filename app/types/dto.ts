export interface CreateInvoiceDto {
    description?: string;
    vendor?: string;
    categoryId?: string;
    departmentId?: string;
}

export interface UpdateInvoiceDto {
    description?: string;
    vendor?: string;
    amount?: number;
    date?: Date;
    categoryId?: string;
    departmentId?: string;
}

export interface Invoice {
    id: string;
    description?: string;
    vendor?: string;
    amount: number;
    date: Date;
    fileName: string;
    category?: {
        id: string;
        name: string;
    };
    department?: {
        id: string;
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
