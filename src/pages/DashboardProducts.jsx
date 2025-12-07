import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, Download, Package } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureNotReady from "../components/common/FeatureNotReady";

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "total_sales",
    direction: "desc",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/fin/v1/api/analytics/products"
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/orders" className="hover:text-orange-600">
              Pesanan Toko
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Detail Produk
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Analisis Produk
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detail performa penjualan per SKU.
          </p>
        </div>
      </div>

      {/* Filters & Table Wrapper */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <FeatureNotReady message="Modul Belum Terhubung" overlay={true}>
          <div className="flex flex-col gap-4 h-full">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 justify-between flex-none">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama produk atau SKU..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center text-sm">
                  <Filter size={16} className="mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleSort("product_name")}
                      >
                        <div className="flex items-center">
                          Nama Produk
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleSort("sku")}
                      >
                        <div className="flex items-center">
                          SKU
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleSort("avg_price")}
                      >
                        <div className="flex items-center justify-end">
                          Harga Rata-rata
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleSort("total_sold")}
                      >
                        <div className="flex items-center justify-end">
                          Terjual
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleSort("total_sales")}
                      >
                        <div className="flex items-center justify-end">
                          Total Penjualan
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          Memuat data produk...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          Tidak ada produk ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-400 flex-shrink-0">
                                <Package size={16} />
                              </div>
                              <div
                                className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-xs"
                                title={product.product_name}
                              >
                                {product.product_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {product.sku || "-"}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(product.avg_price)}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                            {product.total_sold}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                            {formatCurrency(product.total_sales)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 flex-none">
                <span>Menampilkan {filteredProducts.length} produk</span>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FeatureNotReady>
      </div>
    </div>
  );
};

export default DashboardProducts;
