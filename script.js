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

/** ====== DATA LAGU (ubah sesuai kebutuhan) ====== **/
const songs = [
  {
    title: "Lagu Kelas 1",
    artist: "Nama Artis",
    file: "assets/music/lagu-1.mp3"
  },
  {
    title: "Lagu Kelas 2",
    artist: "Nama Artis",
    file: "assets/music/lagu-2.mp3"
  }
];

let currentSongIndex = 0;
let isPlaying = false;

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

/** ====== PLAYLIST ====== **/
function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "song";
    row.innerHTML = `
      <div class="meta">
        <div><b>${escapeHtml(s.title)}</b></div>
        <div class="muted small">${escapeHtml(s.artist)}</div>
      </div>
      <div class="muted small">${i === currentSongIndex ? "Dipilih" : "Klik"}</div>
    `;
    row.addEventListener("click", () => {
      loadSong(i);
      play();
      highlightPlaylist();
    });
    playlistEl.appendChild(row);
  });
}

function highlightPlaylist() {
  [...playlistEl.children].forEach((child, idx) => {
    child.style.background = idx === currentSongIndex ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.03)";
  });
}

function loadSong(index) {
  currentSongIndex = (index + songs.length) % songs.length;
  const s = songs[currentSongIndex];
  audio.src = s.file;
  trackTitle.textContent = s.title;
  trackArtist.textContent = s.artist;
  playBtn.textContent = "Play";
  isPlaying = false;
}

function play() {
  if (!audio.src) loadSong(currentSongIndex);
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = "Pause";
  }).catch(() => {
    // biasanya diblok browser kalau belum ada interaksi user
  });
}

function pause() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "Play";
}

playBtn.addEventListener("click", () => {
  if (isPlaying) pause();
  else play();
});

prevBtn.addEventListener("click", () => {
  loadSong(currentSongIndex - 1);
  play();
  highlightPlaylist();
});

nextBtn.addEventListener("click", () => {
  loadSong(currentSongIndex + 1);
  play();
  highlightPlaylist();
});

audio.addEventListener("ended", () => {
  loadSong(currentSongIndex + 1);
  play();
  highlightPlaylist();
});

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

if (hariSelect) renderJadwal(hariSelect.value);
