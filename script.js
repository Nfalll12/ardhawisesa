const $ = (q) => document.querySelector(q);

const strukturGrid = $("#strukturGrid");
const searchInput = $("#search");
const filterRole = $("#filterRole");

const audio = $("#audio");
const playBtn = $("#playBtn");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const playlistEl = $("#playlist");
const trackTitle = $("#trackTitle");
const trackArtist = $("#trackArtist");

const galeriGrid = $("#galeriGrid");
const modal = $("#modal");
const modalImg = $("#modalImg");
const modalCaption = $("#modalCaption");
const modalBackdrop = $("#modalBackdrop");
const modalClose = $("#modalClose");

$("#year").textContent = new Date().getFullYear();


/** ====== DATA GALERI (ubah sesuai foto kamu) ====== **/
const gallery = [
  { src: "assets/img/siswa-1.jpg", caption: "Momen 1" },
  { src: "assets/img/siswa-2.jpg", caption: "Momen 2" },
  { src: "assets/img/siswa-3.jpg", caption: "Momen 3" },
  { src: "assets/img/siswa-4.jpg", caption: "Momen 4" },
  { src: "assets/img/siswa-5.jpg", caption: "Momen 5" },
  { src: "assets/img/siswa-6.jpg", caption: "Momen 6" }
];

/** ====== STRUKTUR KELAS ====== **/
let siswaData = [];

function renderSiswa(list) {
  strukturGrid.innerHTML = "";
  if (!list.length) {
    strukturGrid.innerHTML = `<div class="muted">Tidak ada hasil.</div>`;
    return;
  }

  list.forEach((s) => {
    const el = document.createElement("div");
    el.className = "person";
    el.innerHTML = `
      <img src="${s.foto}" alt="${escapeHtml(s.nama)}" onerror="this.src='assets/img/header.jpg'"/>
      <div>
        <div class="name">${escapeHtml(s.nama)}</div>
        <div class="badge role-${s.role.toLowerCase()}">${escapeHtml(s.role)}</div>
      </div>
    `;
    strukturGrid.appendChild(el);
  });
}

function applyFilter() {
  const q = (searchInput.value || "").trim().toLowerCase();
  const role = filterRole.value;

  const filtered = siswaData.filter((s) => {
    const okName = s.nama.toLowerCase().includes(q);
    const okRole = role === "all" ? true : s.role === role;
    return okName && okRole;
  });

  renderSiswa(filtered);
}

async function loadSiswa() {
  try {
    const res = await fetch("data/siswa.json");
    siswaData = await res.json();
    renderSiswa(siswaData);
  } catch (e) {
    strukturGrid.innerHTML = `<div class="muted">Gagal memuat data siswa. Pastikan file <b>data/siswa.json</b> ada.</div>`;
  }
}

searchInput.addEventListener("input", applyFilter);
filterRole.addEventListener("change", applyFilter);


/** ====== GALERI + MODAL ====== **/
function renderGallery() {
  galeriGrid.innerHTML = "";
  gallery.forEach((p) => {
    const box = document.createElement("div");
    box.className = "photo";
    box.innerHTML = `
      <img src="${p.src}" alt="${escapeHtml(p.caption)}" loading="lazy" />
      <div class="cap">${escapeHtml(p.caption)}</div>
    `;
    box.addEventListener("click", () => openModal(p.src, p.caption));
    galeriGrid.appendChild(box);
  });
}

function openModal(src, caption) {
  modalImg.src = src;
  modalCaption.textContent = caption;
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

const hariSelect = document.querySelector("#hariSelect");
const jadwalBody = document.querySelector("#jadwalBody");

/** ====== DATA JADWAL (ubah sesuai kelas kamu) ====== **/
const jadwal = {
  Senin: [
    { jam: "07:00 - 08:40", matkul: "Matkul A", info: "Ruang 201" },
    { jam: "08:50 - 10:30", matkul: "Matkul B", info: "Ruang 105" }
  ],
  Selasa: [
    { jam: "07:00 - 08:40", matkul: "Matkul C", info: "Lab 1" },
    { jam: "08:50 - 10:30", matkul: "Matkul D", info: "Ruang 210" }
  ],
  Rabu: [
    { jam: "07:00 - 08:40", matkul: "Matkul E", info: "Ruang 103" }
  ],
  Kamis: [],
  Jumat: [
    { jam: "07:00 - 08:00", matkul: "Kegiatan / Olahraga", info: "-" }
  ],
  Sabtu: []
};

function renderJadwal(hari) {
  if (!jadwalBody) return;
  jadwalBody.innerHTML = "";

  const items = jadwal[hari] || [];
  if (!items.length) {
    jadwalBody.innerHTML = `<tr><td colspan="3" class="muted">Tidak ada jadwal.</td></tr>`;
    return;
  }

  items.forEach((it) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(it.jam)}</td>
      <td><b>${escapeHtml(it.matkul)}</b></td>
      <td class="muted">${escapeHtml(it.info)}</td>
    `;
    jadwalBody.appendChild(tr);
  });
}

if (hariSelect) {
  hariSelect.addEventListener("change", () => renderJadwal(hariSelect.value));
}

/** ====== AYAT HARIAN (API) ====== **/
const harianArab = document.querySelector("#harianArab");
const harianTerjemah = document.querySelector("#harianTerjemah");
const harianRef = document.querySelector("#harianRef");
const refreshHarian = document.querySelector("#refreshHarian");
const copyHarian = document.querySelector("#copyHarian");

const TOTAL_AYAT = 6236; // jumlah ayat Al-Qur'an (umum dipakai)

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// bikin angka stabil per hari (1..6236)
function dailyAyahNumber() {
  const key = todayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return (hash % TOTAL_AYAT) + 1;
}

// ambil salah satu edition terjemah Indonesia dari API (tanpa nebak kode)
async function getIndonesianEditionId() {
  const cacheKey = "idEdition";
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  // daftar edition bahasa Indonesia
  const res = await fetch("https://api.alquran.cloud/v1/edition/language/id");
  const json = await res.json();

  // pilih yang format text + type translation kalau ada
  const pick =
    (json.data || []).find(e => e.format === "text" && e.type === "translation") ||
    (json.data || [])[0];

  const id = pick?.identifier || "en.pickthall"; // fallback
  localStorage.setItem(cacheKey, id);
  return id;
}

async function loadAyahByNumber(n) {
  if (!harianArab || !harianTerjemah || !harianRef) return;

  harianRef.textContent = "Memuat...";
  harianArab.textContent = "—";
  harianTerjemah.textContent = "—";

  try {
    const idEdition = await getIndonesianEditionId();

    // ambil arab (quran-uthmani) + terjemah (idEdition) sekaligus
    const url = `https://api.alquran.cloud/v1/ayah/${n}/editions/quran-uthmani,${idEdition}`;
    const res = await fetch(url);
    const json = await res.json();

    const arab = json.data?.[0];
    const tr = json.data?.[1];

    const surahName = arab?.surah?.englishName || arab?.surah?.name || "Surah";
    const ayahNo = arab?.numberInSurah ?? "";

    harianRef.textContent = `${surahName} : ${ayahNo}`;
    harianArab.textContent = arab?.text || "(gagal memuat teks arab)";
    harianTerjemah.textContent = tr?.text || "(gagal memuat terjemah)";
  } catch (err) {
    harianRef.textContent = "Gagal memuat ayat. Coba refresh.";
    harianTerjemah.textContent = "";
  }
}

function randomAyahNumber() {
  return Math.floor(Math.random() * TOTAL_AYAT) + 1;
}

if (refreshHarian) {
  refreshHarian.addEventListener("click", () => loadAyahByNumber(randomAyahNumber()));
}

if (copyHarian) {
  copyHarian.addEventListener("click", async () => {
    const text = `${harianRef.textContent}\n${harianArab.textContent}\n${harianTerjemah.textContent}`;
    try {
      await navigator.clipboard.writeText(text);
      copyHarian.textContent = "Tersalin ✓";
      setTimeout(() => (copyHarian.textContent = "Salin"), 1200);
    } catch {}
  });
}

/** ====== HELPERS ====== **/
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** ====== INIT ====== **/
loadSiswa();
renderPlaylist();
renderGallery();
loadSong(0);
highlightPlaylist();

if (hariSelect) {
  renderJadwal(hariSelect.value); // otomatis tampil hari pertama (Senin)
}

/* 🔥 AYAT HARIAN LANGSUNG LOAD */
loadAyahByNumber(dailyAyahNumber());
