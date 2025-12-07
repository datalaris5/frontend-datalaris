import React, { useState } from "react";
import toast from "react-hot-toast";
import { User, Lock, CreditCard, Save, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureNotReady from "../../components/common/FeatureNotReady";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SettingsAccount = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock states
  const [name, setName] = useState(user?.name || "Demo User");
  const [email, setEmail] = useState(user?.email || "demo@datalaris.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Pengaturan berhasil disimpan!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Akun</h1>
        <p className="text-muted-foreground text-sm">
          Kelola informasi profil dan preferensi akun Anda.
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        className="flex-1 flex flex-col md:flex-row gap-6"
      >
        <aside className="w-full md:w-64 flex-none">
          <Card className="glass-card-strong border-0 shadow-lg p-2 h-auto md:h-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-1 w-full h-auto bg-transparent gap-1">
              <TabsTrigger
                value="profile"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/30 dark:data-[state=active]:text-orange-400 font-medium"
              >
                <User size={16} className="mr-2" />
                Profil Saya
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/30 dark:data-[state=active]:text-orange-400 font-medium"
              >
                <Lock size={16} className="mr-2" />
                Keamanan
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/30 dark:data-[state=active]:text-orange-400 font-medium"
              >
                <CreditCard size={16} className="mr-2" />
                Tagihan & Langganan
              </TabsTrigger>
            </TabsList>
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Profil Content */}
          <TabsContent value="profile" className="mt-0">
            <Card className="glass-card border-muted/40 shadow-sm">
              <CardHeader>
                <CardTitle>Profil Saya</CardTitle>
                <CardDescription>
                  Perbarui foto dan detail pribadi Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                    >
                      <Camera size={14} />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                      Foto Profil
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Format: JPG, GIF atau PNG. Maks 1MB.
                    </p>
                  </div>
                </div>

                <FeatureNotReady
                  message="Simpan Data Belum Aktif"
                  overlay={true}
                >
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio Singkat</Label>
                        <Input
                          id="bio"
                          placeholder="Ceritakan sedikit tentang toko Anda..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                      >
                        <Save size={16} className="mr-2" />
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  </form>
                </FeatureNotReady>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Content */}
          <TabsContent value="security" className="mt-0">
            <Card className="glass-card border-muted/40 shadow-sm">
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>
                  Kelola password dan keamanan akun Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureNotReady
                  message="Update Password Belum Aktif"
                  overlay={true}
                >
                  <form onSubmit={handleSave} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-pass">Password Saat Ini</Label>
                      <Input
                        id="current-pass"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-pass">Password Baru</Label>
                      <Input
                        id="new-pass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pass">
                        Konfirmasi Password Baru
                      </Label>
                      <Input
                        id="confirm-pass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                      >
                        <Save size={16} className="mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </form>
                </FeatureNotReady>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Content */}
          <TabsContent value="billing" className="mt-0 space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white border-none shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Paket Saat Ini</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-bold">
                        {user?.subscription === "pro"
                          ? "Pro Plan"
                          : "Starter Plan"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          user?.subscription === "pro"
                            ? "border-orange-500 text-orange-400 bg-orange-500/10"
                            : "border-gray-500 text-gray-400"
                        }
                      >
                        {user?.subscription === "pro" ? "Aktif" : "Gratis"}
                      </Badge>
                    </div>
                    {user?.subscription === "pro" && (
                      <p className="text-sm text-gray-400">
                        Berakhir pada 29 Des 2025
                      </p>
                    )}
                  </div>
                  {user?.subscription !== "pro" && (
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-900/20">
                      Upgrade ke Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-muted/40 shadow-sm">
              <CardHeader>
                <CardTitle>Riwayat Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user?.subscription === "pro" ? (
                      <TableRow>
                        <TableCell className="font-medium">
                          29 Nov 2025
                        </TableCell>
                        <TableCell>Langganan Pro (Bulanan)</TableCell>
                        <TableCell>Rp 99.000</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent">
                            Lunas
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Belum ada riwayat pembayaran
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsAccount;
