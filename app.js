/**
 * Main Application Logic
 * Vara's Pulse - 15 Song Playlist & Enhanced Lyrics Dashboard
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- App State ---
  const state = {
    songs: SONGS_DATA,
    filteredSongs: SONGS_DATA,
    currentSongIndex: 0,
    currentLanguage: "All",
    searchQuery: "",
    autoScroll: true,
    fontSize: 1.15, // rem
    activeLineIndex: -1,
  };

  // --- Initialize Audio Engine ---
  const audio = new AudioEngine();

  // --- DOM Elements ---
  const songsGrid = document.getElementById("songsGrid");
  const dashboardsGridView = document.getElementById("dashboardsGridView");
  const songDetailView = document.getElementById("songDetailView");
  const noResultsState = document.getElementById("noResultsState");
  const showingStatsText = document.getElementById("showingStatsText");

  // Search & Filters
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const resetFilterBtn = document.getElementById("resetFilterBtn");
  const langTabs = document.querySelectorAll(".lang-tab");
  const countAll = document.getElementById("countAll");
  const countTelugu = document.getElementById("countTelugu");
  const countHindi = document.getElementById("countHindi");
  const countEnglish = document.getElementById("countEnglish");

  // Detail View Elements
  const btnBackToGrid = document.getElementById("btnBackToGrid");
  const detailCoverImg = document.getElementById("detailCoverImg");
  const detailSongTitle = document.getElementById("detailSongTitle");
  const detailLangBadge = document.getElementById("detailLangBadge");
  const detailGenreBadge = document.getElementById("detailGenreBadge");
  const detailAlbumName = document.getElementById("detailAlbumName");
  const detailSungBy = document.getElementById("detailSungBy");
  const detailLyricsBy = document.getElementById("detailLyricsBy");
  const detailMusicBy = document.getElementById("detailMusicBy");
  const currentSongIndexBadge = document.getElementById("currentSongIndexBadge");
  const btnPrevSongHeader = document.getElementById("btnPrevSongHeader");
  const btnNextSongHeader = document.getElementById("btnNextSongHeader");

  // Player Elements
  const btnMainPlayPause = document.getElementById("btnMainPlayPause");
  const playIconMain = document.getElementById("playIconMain");
  const btnPrevTrack = document.getElementById("btnPrevTrack");
  const btnNextTrack = document.getElementById("btnNextTrack");
  const btnShuffle = document.getElementById("btnShuffle");
  const btnLoop = document.getElementById("btnLoop");
  const seekSlider = document.getElementById("seekSlider");
  const seekProgressFill = document.getElementById("seekProgressFill");
  const currentTimeDisplay = document.getElementById("currentTimeDisplay");
  const totalDurationDisplay = document.getElementById("totalDurationDisplay");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeProgressFill = document.getElementById("volumeProgressFill");
  const btnMuteToggle = document.getElementById("btnMuteToggle");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumePercentDisplay = document.getElementById("volumePercentDisplay");
  const audioEqualizer = document.getElementById("audioEqualizer");
  const liveAudioDot = document.getElementById("liveAudioDot");
  const audioStatusText = document.getElementById("audioStatusText");

  // Lyrics Elements
  const lyricsContentArea = document.getElementById("lyricsContentArea");
  const lyricsScrollContainer = document.getElementById("lyricsScrollContainer");
  const btnFontDec = document.getElementById("btnFontDec");
  const btnFontInc = document.getElementById("btnFontInc");
  const btnAutoScrollToggle = document.getElementById("btnAutoScrollToggle");
  const btnCopyLyrics = document.getElementById("btnCopyLyrics");
  const copyBtnText = document.getElementById("copyBtnText");
  const wordCountBadge = document.getElementById("wordCountBadge");

  // Mini Player Elements
  const miniPlayerBar = document.getElementById("miniPlayerBar");
  const miniCoverImg = document.getElementById("miniCoverImg");
  const miniSongTitle = document.getElementById("miniSongTitle");
  const miniSongArtist = document.getElementById("miniSongArtist");
  const miniPlayBtn = document.getElementById("miniPlayBtn");
  const miniPlayIcon = document.getElementById("miniPlayIcon");
  const miniPrevBtn = document.getElementById("miniPrevBtn");
  const miniNextBtn = document.getElementById("miniNextBtn");
  const miniCurrentTime = document.getElementById("miniCurrentTime");
  const miniTotalTime = document.getElementById("miniTotalTime");
  const miniProgressFill = document.getElementById("miniProgressFill");
  const miniExpandBtn = document.getElementById("miniExpandBtn");
  const miniPlayerInfoTrigger = document.getElementById("miniPlayerInfoTrigger");

  // Theme & Toast
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeMenu = document.getElementById("themeMenu");
  const toastNotification = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");
  const customAudioFile = document.getElementById("customAudioFile");
  const btnLogoHome = document.getElementById("btnLogoHome");

  // --- Initialize Application ---
  function init() {
    updateCounts();
    renderDashboardsGrid();
    loadSong(0, false);
    setupEventListeners();
    refreshIcons();
  }

  // --- Lucide Icons Helper ---
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- Count calculations ---
  function updateCounts() {
    const teluguCount = state.songs.filter(s => s.language === "Telugu").length;
    const hindiCount = state.songs.filter(s => s.language === "Hindi").length;
    const englishCount = state.songs.filter(s => s.language === "English").length;

    countAll.textContent = state.songs.length;
    countTelugu.textContent = teluguCount;
    countHindi.textContent = hindiCount;
    countEnglish.textContent = englishCount;
  }

  // --- Render 15 Song Dashboard Cards ---
  function renderDashboardsGrid() {
    songsGrid.innerHTML = "";

    if (state.filteredSongs.length === 0) {
      noResultsState.classList.remove("hidden");
      showingStatsText.textContent = "Showing 0 songs";
      return;
    }

    noResultsState.classList.add("hidden");
    showingStatsText.textContent = `Showing ${state.filteredSongs.length} of ${state.songs.length} songs`;

    state.filteredSongs.forEach((song, idx) => {
      const card = document.createElement("article");
      const isCurrentPlaying = state.currentSongIndex === getGlobalIndex(song.id) && audio.isPlaying;
      card.className = `song-card ${isCurrentPlaying ? 'now-playing-card' : ''}`;
      card.dataset.id = song.id;

      card.innerHTML = `
        <div class="card-cover-container">
          <img src="${song.cover}" alt="${song.title}" class="card-cover-img" onerror="this.src='images/starboyy.jpg'">
          <span class="card-badge">${song.badge || 'HIT'}</span>
          <span class="card-lang-tag">${song.language}</span>
          <div class="card-play-overlay" title="Play ${song.title}">
            <i data-lucide="${isCurrentPlaying ? 'pause' : 'play'}"></i>
          </div>
        </div>
        <div class="card-info">
          <h3 class="card-title" title="${song.title}">${song.title}</h3>
          <p class="card-meta-line" title="Sung by: ${song.sungBy}">
            <i data-lucide="mic-2" style="width: 14px; height: 14px;"></i>
            <span><strong>Sung by:</strong> ${song.sungBy}</span>
          </p>
          <p class="card-meta-line" title="Lyrics by: ${song.lyricsBy}">
            <i data-lucide="pen-tool" style="width: 14px; height: 14px;"></i>
            <span><strong>Lyrics:</strong> ${song.lyricsBy}</span>
          </p>
          <div class="card-footer-meta">
            <span class="card-genre-pill">${song.mood}</span>
            <span><i data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${song.duration}</span>
          </div>
        </div>
      `;

      // Click card to open dedicated song dashboard & lyrics and play song
      card.addEventListener("click", (e) => {
        const globalIdx = getGlobalIndex(song.id);
        if (globalIdx !== state.currentSongIndex) {
          loadSong(globalIdx, true);
        } else if (!audio.isPlaying) {
          audio.play();
        }
        openDetailView();
      });

      songsGrid.appendChild(card);
    });

    refreshIcons();
  }

  function getGlobalIndex(songId) {
    return state.songs.findIndex(s => s.id === songId);
  }

  // --- Filter and Search ---
  function applyFilters() {
    state.filteredSongs = state.songs.filter(song => {
      const matchesLang = state.currentLanguage === "All" || song.language === state.currentLanguage;
      const query = state.searchQuery.toLowerCase().trim();
      if (!query) return matchesLang;

      const matchesQuery =
        song.title.toLowerCase().includes(query) ||
        song.sungBy.toLowerCase().includes(query) ||
        song.lyricsBy.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query) ||
        song.lyrics.toLowerCase().includes(query) ||
        song.mood.toLowerCase().includes(query);

      return matchesLang && matchesQuery;
    });

    renderDashboardsGrid();
  }

  // --- Load Song into Player & Detail View ---
  function loadSong(index, autoPlay = false) {
    if (index < 0) index = state.songs.length - 1;
    if (index >= state.songs.length) index = 0;

    state.currentSongIndex = index;
    const song = state.songs[index];

    // Load into Audio Engine
    audio.loadSong(song);

    // Update Detail View Elements
    detailCoverImg.src = song.cover;
    detailSongTitle.textContent = song.title;
    detailLangBadge.textContent = song.language;
    detailGenreBadge.textContent = song.badge || song.mood;
    detailAlbumName.textContent = `${song.album} &bull; ${song.mood}`;
    detailSungBy.textContent = song.sungBy;
    detailLyricsBy.textContent = song.lyricsBy;
    detailMusicBy.textContent = song.musicBy || "Original Composition";
    currentSongIndexBadge.textContent = `Song ${index + 1} of ${state.songs.length}`;

    // Update Mini Player
    miniCoverImg.src = song.cover;
    miniSongTitle.textContent = song.title;
    miniSongArtist.textContent = song.sungBy;
    miniTotalTime.textContent = song.duration;
    totalDurationDisplay.textContent = song.duration;

    // Reset Progress
    seekSlider.value = 0;
    seekProgressFill.style.width = "0%";
    miniProgressFill.style.width = "0%";
    currentTimeDisplay.textContent = "0:00";
    miniCurrentTime.textContent = "0:00";
    audioStatusText.textContent = `Loaded: ${song.title}`;

    // Render Enhanced Written Lyrics
    renderEnhancedLyrics(song);

    if (autoPlay) {
      audio.play();
    }

    renderDashboardsGrid();
    refreshIcons();
  }

  // --- Render Enhanced Lyrics (Exact Timestamps & Full Uncut View) ---
  function renderEnhancedLyrics(song) {
    lyricsContentArea.innerHTML = "";
    state.activeLineIndex = -1;

    const timedList = song.timedLyrics || [];
    const words = song.lyrics ? song.lyrics.split(/\s+/).filter(Boolean).length : 0;
    wordCountBadge.textContent = `${words} Words`;

    if (timedList.length > 0) {
      let currentStanzaDiv = document.createElement("div");
      currentStanzaDiv.className = "lyric-stanza";

      timedList.forEach((item, idx) => {
        const text = item.text.trim();
        const isHeader = text.startsWith("[") && text.endsWith("]");

        if (isHeader && idx > 0) {
          lyricsContentArea.appendChild(currentStanzaDiv);
          currentStanzaDiv = document.createElement("div");
          currentStanzaDiv.className = "lyric-stanza";
        }

        const lineSpan = document.createElement("div");
        lineSpan.className = `lyric-line ${isHeader ? 'lyric-section-header' : ''}`;
        lineSpan.dataset.lineIndex = idx;
        lineSpan.dataset.time = item.time;
        lineSpan.textContent = text;

        // Click line to jump audio directly to that exact second!
        lineSpan.addEventListener("click", () => {
          audio.seek(item.time);
          if (!audio.isPlaying) audio.play();
          showToast(`Jumped to: "${text.substring(0, 30)}..." [${formatTime(item.time)}]`);
        });

        currentStanzaDiv.appendChild(lineSpan);
      });

      lyricsContentArea.appendChild(currentStanzaDiv);
    }
  }

  // --- Exact Synchronized Lyrics Highlighting ---
  function updateLyricsHighlight(currentSec, totalSec) {
    const song = state.songs[state.currentSongIndex];
    if (!song.timedLyrics || song.timedLyrics.length === 0) return;

    // Find the exact active line where item.time <= currentSec
    let activeIdx = 0;
    for (let i = 0; i < song.timedLyrics.length; i++) {
      if (currentSec >= song.timedLyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }

    if (activeIdx !== state.activeLineIndex) {
      state.activeLineIndex = activeIdx;

      const allLines = lyricsContentArea.querySelectorAll(".lyric-line");
      allLines.forEach((el, idx) => {
        if (idx === activeIdx) {
          el.classList.add("active-line");
          if (state.autoScroll) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          el.classList.remove("active-line");
        }
      });
    }
  }

  // --- View Switchers ---
  function openDetailView() {
    dashboardsGridView.classList.add("hidden");
    songDetailView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openGridView() {
    songDetailView.classList.add("hidden");
    dashboardsGridView.classList.remove("hidden");
    renderDashboardsGrid();
  }

  // --- Audio Engine Event Callbacks ---
  audio.onTimeUpdate = (currentSec, totalSec) => {
    const safeTotal = totalSec || state.songs[state.currentSongIndex].durationSec || 200;
    const percent = Math.min(100, (currentSec / safeTotal) * 100);

    seekSlider.value = percent;
    seekProgressFill.style.width = `${percent}%`;
    miniProgressFill.style.width = `${percent}%`;

    currentTimeDisplay.textContent = formatTime(currentSec);
    miniCurrentTime.textContent = formatTime(currentSec);

    updateLyricsHighlight(currentSec, safeTotal);
  };

  audio.onPlayStateChange = (isPlaying) => {
    const iconName = isPlaying ? "pause" : "play";
    playIconMain.setAttribute("data-lucide", iconName);
    miniPlayIcon.setAttribute("data-lucide", iconName);

    if (isPlaying) {
      audioEqualizer.classList.add("playing");
      liveAudioDot.classList.add("active");
      audioStatusText.textContent = "Now Playing...";
    } else {
      audioEqualizer.classList.remove("playing");
      liveAudioDot.classList.remove("active");
      audioStatusText.textContent = "Paused";
    }

    renderDashboardsGrid();
    refreshIcons();
  };

  audio.onSongEnd = () => {
    if (audio.isShuffle) {
      const nextIdx = Math.floor(Math.random() * state.songs.length);
      loadSong(nextIdx, true);
    } else {
      loadSong((state.currentSongIndex + 1) % state.songs.length, true);
    }
  };

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Navigation
    btnBackToGrid.addEventListener("click", openGridView);
    btnLogoHome.addEventListener("click", openGridView);
    miniExpandBtn.addEventListener("click", openDetailView);
    miniPlayerInfoTrigger.addEventListener("click", openDetailView);

    // Language Filter Tabs
    langTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        langTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.currentLanguage = tab.dataset.lang;
        applyFilters();
      });
    });

    // Search Input
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      clearSearchBtn.classList.toggle("hidden", !state.searchQuery);
      applyFilters();
    });

    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      clearSearchBtn.classList.add("hidden");
      applyFilters();
      searchInput.focus();
    });

    resetFilterBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      clearSearchBtn.classList.add("hidden");
      state.currentLanguage = "All";
      langTabs.forEach(t => t.classList.toggle("active", t.dataset.lang === "All"));
      applyFilters();
    });

    // Main Audio Controls
    btnMainPlayPause.addEventListener("click", () => audio.togglePlay());
    miniPlayBtn.addEventListener("click", () => audio.togglePlay());

    btnPrevTrack.addEventListener("click", () => loadSong(state.currentSongIndex - 1, true));
    btnNextTrack.addEventListener("click", () => loadSong(state.currentSongIndex + 1, true));
    btnPrevSongHeader.addEventListener("click", () => loadSong(state.currentSongIndex - 1, true));
    btnNextSongHeader.addEventListener("click", () => loadSong(state.currentSongIndex + 1, true));
    miniPrevBtn.addEventListener("click", () => loadSong(state.currentSongIndex - 1, true));
    miniNextBtn.addEventListener("click", () => loadSong(state.currentSongIndex + 1, true));

    // Shuffle & Loop
    btnShuffle.addEventListener("click", () => {
      const active = audio.toggleShuffle();
      btnShuffle.classList.toggle("active", active);
      showToast(active ? "Shuffle Mode ON" : "Shuffle Mode OFF");
    });

    btnLoop.addEventListener("click", () => {
      const active = audio.toggleLoop();
      btnLoop.classList.toggle("active", active);
      showToast(active ? "Loop Repeat ON" : "Loop Repeat OFF");
    });

    // Seek Bar
    seekSlider.addEventListener("input", (e) => {
      const percent = parseFloat(e.target.value);
      seekProgressFill.style.width = `${percent}%`;
      const song = state.songs[state.currentSongIndex];
      const targetSec = (percent / 100) * song.durationSec;
      currentTimeDisplay.textContent = formatTime(targetSec);
    });

    seekSlider.addEventListener("change", (e) => {
      const percent = parseFloat(e.target.value);
      const song = state.songs[state.currentSongIndex];
      const targetSec = (percent / 100) * song.durationSec;
      audio.seek(targetSec);
    });

    // Volume Control
    volumeSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      volumeProgressFill.style.width = `${val * 100}%`;
      volumePercentDisplay.textContent = `${Math.round(val * 100)}%`;
      audio.setVolume(val);
      updateVolumeIcon(val);
    });

    btnMuteToggle.addEventListener("click", () => {
      const isMuted = audio.toggleMute();
      if (isMuted) {
        volumeIcon.setAttribute("data-lucide", "volume-x");
        volumeProgressFill.style.width = "0%";
        volumePercentDisplay.textContent = "0%";
      } else {
        updateVolumeIcon(audio.volume);
        volumeProgressFill.style.width = `${audio.volume * 100}%`;
        volumePercentDisplay.textContent = `${Math.round(audio.volume * 100)}%`;
      }
      refreshIcons();
    });

    // Lyrics Mode Switcher
    const btnModeKaraoke = document.getElementById("btnModeKaraoke");
    const btnModeFull = document.getElementById("btnModeFull");
    const lyricsScrollContainer = document.getElementById("lyricsScrollContainer");

    if (btnModeKaraoke && btnModeFull) {
      btnModeKaraoke.addEventListener("click", () => {
        btnModeKaraoke.classList.add("active");
        btnModeFull.classList.remove("active");
        lyricsScrollContainer.classList.remove("full-reader-view");
        state.lyricsMode = "karaoke";
        showToast("Switched to Synced Karaoke Mode");
      });

      btnModeFull.addEventListener("click", () => {
        btnModeFull.classList.add("active");
        btnModeKaraoke.classList.remove("active");
        lyricsScrollContainer.classList.add("full-reader-view");
        state.lyricsMode = "full";
        showToast("Switched to Full Lyrics Reader View");
      });
    }

    // Lyrics Font Adjustments
    btnFontInc.addEventListener("click", () => {
      state.fontSize = Math.min(1.7, state.fontSize + 0.1);
      lyricsContentArea.style.fontSize = `${state.fontSize}rem`;
    });

    btnFontDec.addEventListener("click", () => {
      state.fontSize = Math.max(0.85, state.fontSize - 0.1);
      lyricsContentArea.style.fontSize = `${state.fontSize}rem`;
    });

    // Auto-Scroll Toggle
    btnAutoScrollToggle.addEventListener("click", () => {
      state.autoScroll = !state.autoScroll;
      btnAutoScrollToggle.classList.toggle("active", state.autoScroll);
      showToast(state.autoScroll ? "Auto-Scroll Enabled" : "Auto-Scroll Disabled");
    });

    // Copy Lyrics Button
    btnCopyLyrics.addEventListener("click", () => {
      const song = state.songs[state.currentSongIndex];
      const copyText = `🎵 ${song.title} (${song.language})\n🎤 Sung by: ${song.sungBy}\n✍️ Lyrics by: ${song.lyricsBy}\n\n${song.lyrics}`;
      navigator.clipboard.writeText(copyText).then(() => {
        copyBtnText.textContent = "Copied!";
        showToast("Full lyrics copied to clipboard!");
        setTimeout(() => { copyBtnText.textContent = "Copy"; }, 2000);
      });
    });

    // Custom Audio File Upload
    customAudioFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        const song = state.songs[state.currentSongIndex];
        song.audioSrc = objectUrl;
        audio.loadSong(song);
        audio.play();
        showToast(`Loaded local track for "${song.title}"!`);
      }
    });

    // Theme Switcher
    themeToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle("hidden");
    });

    document.querySelectorAll(".theme-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        const theme = opt.dataset.theme;
        document.body.className = theme;
        document.querySelectorAll(".theme-opt").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        themeMenu.classList.add("hidden");
        showToast(`Theme changed to ${opt.textContent.trim()}`);
      });
    });

    document.addEventListener("click", () => {
      themeMenu.classList.add("hidden");
    });
  }

  // --- Helper Functions ---
  function updateVolumeIcon(val) {
    if (val === 0) {
      volumeIcon.setAttribute("data-lucide", "volume-x");
    } else if (val < 0.5) {
      volumeIcon.setAttribute("data-lucide", "volume-1");
    } else {
      volumeIcon.setAttribute("data-lucide", "volume-2");
    }
    refreshIcons();
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function showToast(msg) {
    toastMessage.textContent = msg;
    toastNotification.classList.remove("hidden");
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toastNotification.classList.add("hidden");
    }, 2500);
  }

  // Start app
  init();
});
