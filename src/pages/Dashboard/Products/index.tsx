/**
 * Dashboard Products
 * ------------------
 * Halaman analisis produk berdasarkan data pesanan.
 * Menampilkan tabel produk dengan sorting dan search.
 *
 * Fitur:
 * - Tabel produk dengan kolom: Nama, SKU, Harga Rata-rata, Terjual, Total
 * - Search by nama produk atau SKU
 * - Sortable columns
 * - Pagination (placeholder)
 *
 * Catatan: Halaman ini masih dalam tahap "Segera Hadir"
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent } from "react";
import { Search, Filter, ArrowUpDown, Package } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { api } from "@/services/api";

// Shadcn UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tipe untuk produk dari API
interface Product {
  product_name?: string;
  sku?: string;
  avg_price?: number;
  total_sold?: number;
  total_sales?: number;
}

// Tipe untuk konfigurasi sorting
interface SortConfig {
  key: keyof Product;
  direction: "asc" | "desc";
}

const DashboardProducts: React.FC = () => {
  // State untuk data dan UI
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "total_sales",
    direction: "desc",
  });

  // Fetch data saat komponen mount
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Fetch data produk dari API
   */
  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.dashboard.getProductsAnalytics();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler untuk mengubah sorting
   * Toggle asc/desc jika klik kolom yang sama
   */
  const handleSort = (key: keyof Product): void => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort products berdasarkan sortConfig
  const sortedProducts = [...(products || [])].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal === undefined || bVal === undefined) return 0;
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filter berdasarkan search term
  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Format angka ke format Rupiah
   */
  const formatCurrency = (value?: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in">
      {/* Header dengan Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link
              to="/orders"
              className="hover:text-orange-600 transition-colors"
            >
              Pesanan Toko
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Detail Produk</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Analisis Produk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detail performa penjualan per SKU.
          </p>
        </div>
      </div>

      {/* Filter & Table Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <FeatureNotReady message="Segera Hadir" overlay={true}>
          <div className="flex flex-col gap-4 h-full">
            {/* Filter Bar */}
            <Card className="glass-card rounded-2xl flex-none">
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    type="text"
                    placeholder="Cari nama produk atau SKU..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="filter" className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabel Produk */}
            <Card className="flex-1 min-h-0 glass-card-strong rounded-2xl flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("product_name")}
                      >
                        <div className="flex items-center">
                          Nama Produk
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("sku")}
                      >
                        <div className="flex items-center">
                          SKU
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("avg_price")}
                      >
                        <div className="flex items-center justify-end">
                          Harga Rata-rata
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("total_sold")}
                      >
                        <div className="flex items-center justify-end">
                          Terjual
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("total_sales")}
                      >
                        <div className="flex items-center justify-end">
                          Total Penjualan
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                        >
                          Tidak ada produk ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-400 flex-shrink-0">
                                <Package size={18} />
                              </div>
                              <div
                                className="font-medium text-foreground line-clamp-2 max-w-xs"
                                title={product.product_name}
                              >
                                {product.product_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {product.sku || "-"}
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            {formatCurrency(product.avg_price)}
                          </TableCell>
                          <TableCell className="text-right text-foreground font-medium">
                            {product.total_sold ?? 0}
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {formatCurrency(product.total_sales)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Footer pagination */}
              <div className="px-6 py-3 border-t bg-muted/50 flex justify-between items-center text-sm text-muted-foreground flex-none">
                <span>Menampilkan {filteredProducts.length} produk</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </FeatureNotReady>
      </div>
    </div>
  );
};

export default DashboardProducts;
