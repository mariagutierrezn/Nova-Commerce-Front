/**
 * Modelo de Producto para el marketplace
 * Representa un producto disponible para la venta
 */
export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  categoryId?: string;
  stockQuantity?: number;  // Cambiar de stock a stockQuantity para coincidir con el backend
  productType?: 'PHYSICAL' | 'DIGITAL';
  createdAt?: string;
  updatedAt?: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
}

/**
 * Modelo de Categoría
 * Clasificación de productos en el marketplace
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Respuesta paginada de productos desde el backend
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Filtros para búsqueda de productos
 */
export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  hasDiscount?: boolean;
}
