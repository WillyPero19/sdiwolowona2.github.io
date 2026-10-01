let myChart = null;
let globalSiswaData = []; // Menyimpan data siswa global untuk fitur pencarian

document.addEventListener("DOMContentLoaded", function () {
    // Ambil file database.json yang ada di repositori GitHub
    fetch('database.json?t=' + new Date().getTime()) // Prevent browser cache
        .then(response => {
            if (!response.ok) {
                throw new Error("File database.json belum ditemukan di server GitHub.");
            }
            return response.json();
        })
        .then(data => {
            globalSiswaData = data.listDataSiswa || [];
            updateDashboard(data);
        })
        .catch(error => {
            console.error("Gagal memuat data dari GitHub:", error);
        });
});

function updateDashboard(data) {
    // 1. Update Angka Statistik
    document.getElementById("val-total-siswa").textContent = data.totalSiswa;
    document.getElementById("val-total-guru").textContent = data.totalGuru;
    document.getElementById("val-total-tendik").textContent = data.totalTendik;
    document.getElementById("val-residu-total").textContent = data.residuTotal + " Siswa";

    // 2. Update Pengumuman
    const infoList = document.querySelector(".info-list");
    if (infoList && data.listPengumuman) {
        infoList.innerHTML = "";
        data.listPengumuman.forEach(p => {
            const li = document.createElement("li");
            const badgeClass = p.Tipe === "warning" ? "badge warning" : "badge info";
            li.innerHTML = `
                <span class="${badgeClass}">${p.Badge || 'Info'}</span>
                <strong>${p.Judul || ''}:</strong> ${p.Isi || ''}
            `;
            infoList.appendChild(li);
        });
    }

    // 3. Update Tabel Residu
    const tbody = document.getElementById("tabel-residu-body");
    if (tbody && data.listResidu) {
        tbody.innerHTML = "";
        data.listResidu.forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${s.NISN || s.nisn || '-'}</td>
                <td><strong>${s["Nama Siswa"] || s.nama || '-'}</strong></td>
                <td>${s.Kelas || s.kelas || '-'}</td>
                <td><span style="color:#ef4444; font-weight:bold;">${s["Keterangan Residu"] || s.kurang || 'Belum Lengkap'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Update Grafik
    const siswaLengkap = Math.max(0, data.totalSiswa - data.residuTotal);
    renderChart(siswaLengkap, data.residuTotal);
}

// 5. CEK NILAI & KEHADIRAN SISWA REAL
function cariSiswa() {
    const inputNisn = document.getElementById("input-nisn").value.trim();
    const resDiv = document.getElementById("hasil-cek-siswa");

    if (!inputNisn) {
        resDiv.innerHTML = `<p style="color:#ef4444; font-weight:bold;">⚠️ Silakan masukkan NISN Siswa!</p>`;
        return;
    }

    // Cari Siswa berdasarkan NISN dari data GitHub
    const siswa = globalSiswaData.find(s => String(s.NISN).trim() === inputNisn);

    if (siswa) {
        const kehadiran = siswa.Kehadiran || "Hadir (100%)";
        const statusBerkas = siswa["Status Berkas"] || "Belum Lengkap";
        const rataNilai = siswa["Rata Rata Nilai"] !== undefined ? siswa["Rata Rata Nilai"] : "Belum ada Nilai";
        const statusColor = statusBerkas === "Terverifikasi" ? "#10b981" : "#ef4444";

        resDiv.innerHTML = `
            <div style="background:#f1f5f9; padding:1.2rem; border-radius:8px; text-align:left; border-left: 4px solid #2563eb; margin-top:1rem;">
                <h3 style="margin-bottom:0.5rem; color:#1e293b;">👤 ${siswa["Nama Siswa"] || 'Siswa'} (${siswa.Kelas || 'Kelas -'})</h3>
                <p><strong>NISN:</strong> ${siswa.NISN}</p>
                <hr style="margin: 0.5rem 0; border:none; border-top:1px solid #cbd5e1;">
                <p style="margin-bottom:0.4rem;"><strong>Status Kehadiran:</strong> <span style="color:#10b981; font-weight:bold;">${kehadiran}</span></p>
                <p style="margin-bottom:0.4rem;"><strong>Status Kelengkapan Berkas:</strong> <span style="color:${statusColor}; font-weight:bold;">${statusBerkas}</span></p>
                <p style="margin-bottom:0.4rem;"><strong>Rata-rata Nilai Semester:</strong> <span style="font-size:1.1rem; font-weight:bold; color:#2563eb;">${rataNilai}</span></p>
            </div>
        `;
    } else {
        resDiv.innerHTML = `
            <div style="background:#fef2f2; color:#dc2626; padding:1rem; border-radius:8px; text-align:center; margin-top:1rem;">
                ❌ Data siswa dengan NISN <strong>${inputNisn}</strong> tidak ditemukan.
            </div>
        `;
    }
}

function renderChart(lengkap, residu) {
    const ctx = document.getElementById('chartResidu');
    if (!ctx) return;

    if (myChart) { myChart.destroy(); }

    myChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Data Lengkap', 'Residu Data'],
            datasets: [{
                data: [lengkap, residu],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }