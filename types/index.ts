export type ServiceCategory = 'service' | 'product';
export type ServiceStatus = 'active' | 'inactive';

export interface Service {
    id: string;
    name: string;
    price: string;
    duration: string;
    category: ServiceCategory;
    status?: ServiceStatus;
    subCategory?: string;
    stock?: string;
    sku?: string;
    company?: string;
    serviceTypes?: string[];
    images?: string[];
    description?: string;
    otherServiceName?: string;
    purchasePrice?: string;
    uom?: string;
}

export type SheetMode = 'add' | 'edit';
