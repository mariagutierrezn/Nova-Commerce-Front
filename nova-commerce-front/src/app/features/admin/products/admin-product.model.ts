export interface AdminProduct {
  id: string; // MongoDB ObjectId como String
  name: string;
  description?: string;
  imageUrl?: string | null;
  price: number;
  productType: string;
  categoryId?: string; // String para coincidir con backend
  stockQuantity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminProductInput {
  name: string;
  description?: string;
  imageUrl?: string | null;
  price: number;
  productType: string; // Requerido por backend
  categoryId: string; // Requerido por backend (String, no number)
  stockQuantity: number;
  status: 'ACTIVE' | 'INACTIVE'; // Requerido por backend
}
