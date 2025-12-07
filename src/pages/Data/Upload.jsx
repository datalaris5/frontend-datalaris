import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  TrendingUp,
  MessageCircle,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import { useFilter } from "../../context/FilterContext";

// Shadcn UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DataUpload = () => {
  const { store, platform } = useFilter();
  const [activeTab, setActiveTab] = useState("overview");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load History
  useEffect(() => {
    const fetchHistory = async () => {
      if (!store || store === "all") return;
      setLoadingHistory(true);
      try {
        const res = await api.upload.getHistory(store);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        // Fallback to empty or keep previous if any
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus(null);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (platform !== "shopee") {
      toast.error("Saat ini hanya support upload untuk Shopee");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Mengupload data...");

    const formData = new FormData();
    formData.append("file", file);

    if (store !== "all") {
      formData.append("store_id", store);
    } else {
      toast.error("Silakan pilih toko terlebih dahulu di bagian atas halaman", {
        id: loadingToast,
      });
      setUploading(false);
      return;
    }

    try {
      await api.upload.send(platform, activeTab, formData, store);

      setUploadStatus("success");
      toast.success("Data berhasil diupload!", { id: loadingToast });

      // Refresh history
      const res = await api.upload.getHistory(store);
      setHistory(res.data || []);

      setTimeout(() => {
        setFile(null);
        setUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      const errMsg =
        error.response?.data?.error || "Terjadi kesalahan saat upload";
      toast.error(`Upload gagal: ${errMsg}`, { id: loadingToast });
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const dataTypes = {
    shopee: [
      {
        id: "overview",
        label: "Shopee Tinjauan",
        icon: TrendingUp,
        color: "blue",
        desc: "Ringkasan harian performa toko",
      },
      {
        id: "orders",
        label: "Shopee Pesanan",
        icon: FileSpreadsheet,
        color: "orange",
        desc: "Detail pesanan per item",
      },
      {
        id: "ads",
        label: "Shopee Iklan",
        icon: Megaphone,
        color: "purple",
        desc: "Data performa iklan Shopee",
      },
      {
        id: "chat",
        label: "Shopee Chat",
        icon: MessageCircle,
        color: "green",
        desc: "Data customer service chat",
      },
    ],
  };

  const platformNames = {
    shopee: "Shopee",
    "tiktok-tokopedia": "TikTok & Tokopedia",
    all: "Semua Platform",
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto w-full animate-fade-in pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Pusat Upload Data</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Platform:</span>
          <Badge variant="secondary" className="font-semibold">
            {platformNames[platform]}
          </Badge>
          {platform !== "shopee" && (
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
      {platform === "shopee" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dataTypes.shopee.map((type) => {
            const Icon = type.icon;
            const isActive = activeTab === type.id;
            return (
              <Card
                key={type.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md border-2",
                  isActive
                    ? `border-${type.color}-500 bg-${type.color}-50/30 dark:bg-${type.color}-900/10`
                    : "hover:border-primary/50"
                )}
                onClick={() => {
                  setActiveTab(type.id);
                  setFile(null);
                  setUploadStatus(null);
                }}
              >
                <CardContent className="p-4 flex flex-col items-start gap-2">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isActive
                        ? `bg-${type.color}-100 text-${type.color}-600`
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4
                      className={cn(
                        "font-bold text-sm",
                        isActive && `text-${type.color}-700`
                      )}
                    >
                      {type.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <Card className="lg:col-span-2 glass-card border-dashed border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Format yang didukung: .xlsx, .xls, .csv (Max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all h-64",
                store === "all"
                  ? "opacity-50 cursor-not-allowed bg-muted"
                  : "cursor-pointer",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              )}
              onDragEnter={store !== "all" ? handleDrag : null}
              onDragLeave={store !== "all" ? handleDrag : null}
              onDragOver={store !== "all" ? handleDrag : null}
              onDrop={store !== "all" ? handleDrop : null}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleChange}
                accept=".xlsx,.xls,.csv"
                disabled={uploading || store === "all"}
              />

              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className={cn(
                    "p-4 rounded-full transition-colors",
                    uploadStatus === "success"
                      ? "bg-green-100 text-green-600"
                      : file
                      ? "bg-orange-100 text-orange-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {uploadStatus === "success" ? (
                    <CheckCircle size={32} />
                  ) : file ? (
                    <FileSpreadsheet size={32} />
                  ) : (
                    <UploadCloud size={32} />
                  )}
                </div>

                <div>
                  {uploadStatus === "success" ? (
                    <p className="text-lg font-bold text-green-600">
                      Upload Berhasil!
                    </p>
                  ) : file ? (
                    <>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        Drag & drop file Excel di sini
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        atau klik untuk memilih file
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {file && !uploadStatus && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || store === "all"}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/20"
                >
                  {uploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {uploading ? "Memproses..." : "Proses Data"}
                </Button>
              </div>
            )}
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
