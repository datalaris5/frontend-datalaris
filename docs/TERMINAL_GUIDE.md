# 💻 Terminal Command Guidelines - Datalaris

> **Tujuan:** Panduan untuk AI dalam menjalankan terminal command dengan sukses.  
> **OS:** Windows  
> **Shell:** CMD  
> **Last Updated:** 2024-12-15

> [!NOTE] > **Related Documents:**
>
> - [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Standar & aturan frontend
> - [API_CATALOG.md](./API_CATALOG.md) - Daftar endpoint
> - [BACKEND_ISSUES.md](./BACKEND_ISSUES.md) - Bug tracker

> [!CAUTION] > **ATURAN WAJIB untuk AI:**
>
> **DILARANG** menjalankan terminal command dengan `run_command` langsung + `WaitMsBeforeAsync` panjang (>500ms).
>
> **WAJIB** gunakan **Metode 2-Step**:
>
> 1. `run_command` dengan `WaitMsBeforeAsync: 500` (buka terminal saja)
> 2. `send_command_input` dengan `Input: "command\n"` (kirim command + Enter)
>
> Pelanggaran akan menyebabkan terminal hang dan command tidak pernah selesai!

---

## ✅ Command yang Aman Auto-Run

Command yang bisa di-set `SafeToAutoRun: true`:

| Command         | Fungsi            |
| --------------- | ----------------- |
| `dir`           | List directory    |
| `type <file>`   | View file content |
| `git status`    | Git status        |
| `git log -n 5`  | Git log (limited) |
| `npm run lint`  | Lint check        |
| `npm run build` | Build             |
| `npm run dev`   | Start dev server  |

---

## 🚨 Command yang Butuh Approval

Command yang HARUS di-set `SafeToAutoRun: false`:

| Command                             | Alasan               |
| ----------------------------------- | -------------------- |
| `del`, `rd`, `rmdir`                | Hapus file/folder    |
| `move`, `ren`                       | Pindah/rename file   |
| `npm install`                       | Install dependencies |
| `git add`, `git commit`, `git push` | Git write operations |

---

## ⚠️ Common Pitfalls

### 1. Path dengan Spasi

```cmd
# ❌ SALAH
cd f:\Coding-Projects\Project Web Apps

# ✅ BENAR
cd "f:\Coding-Projects\Project Web Apps"
```

### 2. Gunakan Windows Syntax

```cmd
# ❌ SALAH (Unix)
mv old.md new.md

# ✅ BENAR (Windows)
ren old.md new.md
```

### 3. Selalu Pakai Absolute Path

```javascript
// ✅ BENAR
Cwd: "f:\\Coding-Projects\\Project Web Apps - Datalaris\\frontend";

// ❌ SALAH
Cwd: "./frontend";
```

---

## 🚀 Best Practice: Menjalankan Terminal Command

> **PENTING:** Metode ini sudah terbukti **100% berhasil** dan efisien.

### Metode 2-Step (Recommended)

```javascript
// Step 1: Buka terminal dengan wait singkat
run_command({
  CommandLine: "npm run build",
  Cwd: "f:\\Coding-Projects\\Project Web Apps - Datalaris\\frontend",
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 500, // Cukup untuk buka terminal
});
// → Akan return CommandId

// Step 2: LANGSUNG kirim command via send_command_input
send_command_input({
  CommandId: "command-id-dari-step-1",
  Input: "npm run build\n", // WAJIB ada \n di akhir!
  SafeToAutoRun: true,
  WaitMs: 10000, // Sesuaikan durasi command
});
// → Output langsung muncul!
```

### Kenapa Metode Ini?

| Aspek         | Penjelasan                                                     |
| ------------- | -------------------------------------------------------------- |
| **Reliable**  | `send_command_input` secara eksplisit mengirim command + Enter |
| **Efisien**   | Tidak perlu menunggu `command_status` berkali-kali             |
| **Konsisten** | Selalu berhasil di Windows CMD                                 |

### Aturan Penting

1. **WAJIB** include `\n` (newline) di akhir Input
2. **JANGAN** tunggu lama di `run_command` - cukup 500ms
3. **Set `WaitMs`** sesuai durasi command:
   - `npm run build` → 10000-30000ms
   - `git status` → 3000ms
   - `npm run dev` → 5000ms (lalu biarkan berjalan di background)

### Contoh Lengkap: Pre-Commit Check

```javascript
// 1. Open terminal
const terminal = run_command({
  CommandLine: "npm run build",
  Cwd: "f:\\path\\to\\frontend",
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 500,
});

// 2. Send build command
send_command_input({
  CommandId: terminal.CommandId,
  Input: "npm run build\n",
  SafeToAutoRun: true,
  WaitMs: 30000,
});
// Output: ✓ built in 31.24s

// 3. Check git status
send_command_input({
  CommandId: terminal.CommandId,
  Input: "git status\n",
  SafeToAutoRun: true,
  WaitMs: 5000,
});
// Output: git status results
```

---

## 📚 Command Reference

### Frontend

| Task      | Command         |
| --------- | --------------- |
| Start dev | `npm run dev`   |
| Build     | `npm run build` |
| Lint      | `npm run lint`  |

### Git

| Task   | Command        |
| ------ | -------------- |
| Status | `git status`   |
| Log    | `git log -n 5` |
| Diff   | `git diff`     |
