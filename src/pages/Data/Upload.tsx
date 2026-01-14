/**
 * Data Upload
 * -----------
 * Halaman untuk upload file data dari Shopee.
 *
 * Fitur:
 * - Pilih tipe data (Tinjauan, Pesanan, Iklan, Chat)
 * - Drag & drop MULTIPLE files
 * - Riwayat upload
 *
 * Catatan: Saat ini hanya support platform Shopee
 */

import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  TrendingUp,
  MessageCircle,
  Megaphone,
  AlertCircle,
  LucideIcon,
  ShoppingBag,
  X,
  FileWarning,
  Info,
} from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  UPLOAD_TYPES,
  allowedExtensions,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  UploadType,
  PlatformKey,
  PLATFORMS,
} from "@/types/upload.types";

// Tipe untuk history item
interface HistoryItem {
  filename: string;
  created_at?: string;
  status?: string;
}

// Tipe untuk data type option
interface DataTypeOption {
  id: UploadType;
  label: string;
  icon: LucideIcon;
  color: string;
  desc: string;
}

const DataUpload: React.FC = () => {
  const { store, platform } = useFilter();
  const [activeTab, setActiveTab] = useState<UploadType>(UPLOAD_TYPES.OVERVIEW);
  const [dragActive, setDragActive] = useState(false);

  // State untuk Multiple Files
  const [files, setFiles] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(
    null
  );

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch history saat store berubah
  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      if (!store || store === "all") return;
      setLoadingHistory(true);
      try {
        const res = await api.upload.getHistory(store);
        setHistory(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (store !== "all") {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [store]);

  /**
   * Validasi params file satu per satu
   */
  const validateFile = (file: File): boolean => {
    // 1. Cek ukuran
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`${file.name}: Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB`);
      return false;
    }

    // 2. Cek ekstensi
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!isValidExtension) {
      toast.error(`${file.name}: Format tidak didukung`);
      return false;
    }

    return true;
  };

  /**
   * Handler untuk drag event
   */
  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handler untuk drop file (Multiple)
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setUploadStatus(null);
      }
    }
  };

  /**
   * Handler untuk input file change (Multiple)
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setUploadStatus(null);
      }
      // Reset input value agar bisa select file yang sama lagi kalau dihapus
      e.target.value = "";
    }
  };

  /**
   * Remove individual file from list
   */
  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Handler untuk upload MASSAL ke backend
   */
  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return;

    if (platform !== PLATFORMS.SHOPEE) {
      toast.error("Saat ini hanya support upload untuk Shopee");
      return;
    }

    if (store === "all") {
      toast.error("Silakan pilih toko terlebih dahulu");
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setProgress({ current: 0, total: files.length });

    let successCount = 0;
    let failCount = 0;

    // Toast Loading ID
    const loadingToast = toast.loading(`Mengupload 0/${files.length} file...`);

    // Loop upload satu per satu (Sequential biar aman & status jelas)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update toast progress
      toast.loading(`Mengupload ${i + 1}/${files.length}: ${file.name}...`, {
        id: loadingToast,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("store_id", store);

      try {
        await api.upload.send(platform, activeTab, formData, store);
        successCount++;
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        failCount++;
        // Optional: Simpan error message per file jika perlu
      }

      // Update progress state
      setProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    // Final Report
    if (failCount === 0) {
      setUploadStatus("success");
      toast.success(`Sukses! ${successCount} file berhasil diupload.`, {
        id: loadingToast,
      });
      setFiles([]); // Clear all if smooth
    } else if (successCount === 0) {
      setUploadStatus("error");
      toast.error(`Gagal! Semua ${failCount} file gagal diupload.`, {
        id: loadingToast,
      });
    } else {
      // Partial Success
      toast.success(`Selesai. ${successCount} sukses, ${failCount} gagal.`, {
        id: loadingToast,
      });
      // Keep files (or failed files only) could be an improvement later
      setFiles([]);
    }

    // Refresh history
    setUploading(false);
    try {
      const res = await api.upload.getHistory(store);
      setHistory(res.data?.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  // Konfigurasi tipe data per platform
  const dataTypes: Record<string, DataTypeOption[]> = {
    [PLATFORMS.SHOPEE]: [
      {
        id: UPLOAD_TYPES.OVERVIEW,
        label: "Shopee Tinjauan",
        icon: TrendingUp,
        color: "blue",
        desc: "Ringkasan harian performa toko",
      },
      {
        id: UPLOAD_TYPES.ORDERS,
        label: "Shopee Pesanan",
        icon: ShoppingBag,
        color: "orange",
        desc: "Detail pesanan per item",
      },
      {
        id: UPLOAD_TYPES.ADS,
        label: "Shopee Iklan",
        icon: Megaphone,
        color: "purple",
        desc: "Data performa iklan Shopee",
      },
      {
        id: UPLOAD_TYPES.CHAT,
        label: "Shopee Chat",
        icon: MessageCircle,
        color: "green",
        desc: "Data customer service chat",
      },
    ],
  };

  const platformNames: Record<string, string> = {
    [PLATFORMS.SHOPEE]: "Shopee",
    [PLATFORMS.TIKTOK_TOKOPEDIA]: "TikTok & Tokopedia",
    [PLATFORMS.ALL]: "Semua Platform",
  };

  return (
    <div className="flex flex-col h-full gap-6 w-full animate-fade-in pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Pusat Upload Data</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Platform:</span>
          <Badge variant="secondary" className="font-semibold">
            {platformNames[platform] || platform}
          </Badge>
          {platform !== PLATFORMS.SHOPEE && (
            <Badge
              variant="outline"
              className="text-xs border-blue-200 bg-blue-50 text-blue-700"
            >
              Coming Soon
            </Badge>
          )}
        </div>
      </div>

      {/* Warning: No Store Selected */}
      {store === "all" && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="p-4 flex gap-4">
            <AlertCircle className="text-orange-600 shrink-0" />
            <div>
              <h4 className="font-bold text-orange-800 dark:text-orange-400">
                Pilih Toko Terlebih Dahulu
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Silakan pilih toko dari dropdown di pojok kanan atas sebelum
                mengupload data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Type Selection */}
      {/* Data Type Selection using Tabs */}
      {platform === PLATFORMS.SHOPEE && (
        <div className="w-full">
          <TooltipProvider>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as UploadType);
                setFiles([]);
                setUploadStatus(null);
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50">
                {dataTypes[PLATFORMS.SHOPEE].map((type) => {
                  const Icon = type.icon;
                  // Use a distinct "Info Area" for the tooltip to avoid nesting buttons
                  return (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="group flex flex-col items-center gap-2 py-3 relative data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                    >
                      <Icon size={18} />
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold">
                          {type.label}
                        </span>

                        {/* Info Icon with Tooltip */}
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <span
                              className="cursor-default opacity-40 hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()} // Prevent tab selection when clicking info
                            >
                              <Info size={12} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-[200px] text-xs"
                          >
                            <p>{type.desc}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </TooltipProvider>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <Card className="lg:col-span-2 glass-card border-dashed border-2 shadow-sm flex flex-col h-full">
          <CardHeader>
            <CardTitle>Upload Massal</CardTitle>
            <CardDescription>
              Format: {allowedExtensions.join(", ")} (Max {MAX_FILE_SIZE_MB}
              MB/file)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {/* 
               FIXED HEIGHT: We use h-[500px] to force the container to have a specific size. 
               This ensures the internal "ScrollArea" will actually scroll when files > 7.
               If we used min-h, it would just grow endlessly.
            */}
            <div className="grid grid-cols-1 md:grid-cols-5 h-[500px]">
              {/* Left Side: Drop Zone */}
              <div className="md:col-span-2 p-6 border-r border-dashed bg-muted/10 h-full flex flex-col justify-center">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all h-full min-h-[250px]",
                    store === "all"
                      ? "opacity-50 cursor-not-allowed bg-muted"
                      : "cursor-pointer",
                    dragActive
                      ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                  )}
                  onDragEnter={store !== "all" ? handleDrag : undefined}
                  onDragLeave={store !== "all" ? handleDrag : undefined}
                  onDragOver={store !== "all" ? handleDrag : undefined}
                  onDrop={store !== "all" ? handleDrop : undefined}
                >
                  <input
                    type="file"
                    multiple // Enable MULTIPLE selection
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleChange}
                    accept={allowedExtensions.join(",")}
                    disabled={uploading || store === "all"}
                  />
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div
                      className={cn(
                        "p-4 rounded-full transition-colors shadow-sm",
                        uploadStatus === "success"
                          ? "bg-green-100 text-green-600"
                          : files.length > 0
                          ? "bg-blue-100 text-blue-600"
                          : "bg-background shadow-inner text-muted-foreground"
                      )}
                    >
                      {uploadStatus === "success" ? (
                        <CheckCircle size={32} />
                      ) : (
                        <UploadCloud size={32} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-base text-foreground">
                        Drop items here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 px-4">
                        or click to browse from your computer
                      </p>
                    </div>
                    {files.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        +{files.length} file dipilih
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: File Queue & Actions */}
              <div className="md:col-span-3 p-6 flex flex-col h-full bg-background/50 overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-primary" />
                    File Queue
                  </h3>
                  {files.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {files.length} file ready
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-h-0 bg-muted/20 border rounded-lg overflow-hidden relative">
                  {files.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                      <FileSpreadsheet className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No files selected</p>
                      <p className="text-xs opacity-70">
                        Files you select will appear here
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-full w-full p-2">
                      <div className="space-y-2 pb-2">
                        {files.map((file, idx) => (
                          <div
                            key={idx}
                            className="group flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm hover:shadow-md transition-all text-sm"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
                                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate max-w-[150px] font-medium text-foreground">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {(file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!uploading && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(idx)}
                                >
                                  <X size={14} />
                                </Button>
                              )}
                              {uploading && progress.current === idx + 1 && (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              )}
                              {uploading && progress.current > idx + 1 && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 flex justify-end gap-3 pt-2 border-t border-dashed shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setFiles([])}
                    disabled={files.length === 0 || uploading}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    Clear All
                  </Button>

                  <Button
                    onClick={handleUpload}
                    disabled={
                      files.length === 0 || uploading || store === "all"
                    }
                    className={cn(
                      "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/20 transition-all",
                      files.length === 0 &&
                        "opacity-50 grayscale cursor-not-allowed shadow-none"
                    )}
                  >
                    {uploading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {uploading
                      ? "Proses..."
                      : `Upload ${
                          files.length > 0 ? files.length + " Files" : ""
                        }`}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="glass-card flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Riwayat Upload</CardTitle>
            <CardDescription>30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px]">
              {loadingHistory ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  Belum ada riwayat upload.
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {history.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className="font-medium text-sm truncate max-w-[150px]"
                              title={item.filename}
                            >
                              {item.filename}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                item.created_at || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              item.status === "success"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              item.status === "success"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {item.status || "Success"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataUpload;
