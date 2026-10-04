// Modal Overlay Controller Functions
function openGameModal(title, gameUrl) {
  const modal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalIframe = document.getElementById('modalIframe');

  if (modalTitle) modalTitle.textContent = title;
  if (modalIframe) modalIframe.src = gameUrl;
  if (modal) modal.classList.add('active');
}

function closeGameModal() {
  const modal = document.getElementById('gameModal');
  const modalIframe = document.getElementById('modalIframe');

  if (modal) modal.classList.remove('active');
  if (modalIframe) modalIframe.src = 'about:blank'; // Clears iframe to stop game audio/loops
}

document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  const trackThumb = document.getElementById('trackThumb');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const playBtn = document.getElementById('playBtn');

  const homeBtn = document.getElementById('homeBtn');

  const modal = document.getElementById('gameModal');

  let selectedIndex = 0;   // Active album section
  let hoverIndex = null;     // Hovered album section
  let isFullView = false;    // Full album view flag
  let activeTrackIdx = null; // Expanded track index (null = all collapsed)

  // Modal event handlers
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeGameModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGameModal();
    }
  });

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      isFullView = false;
      activeTrackIdx = null;

      // Reset sidebar selection back to index 0
      selectedIndex = 0;
      menuItems.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Return to stage 1 preview card state
      previewSection(selectedIndex);

      // Reset player button icon to Play '▶'
      if (playBtn) playBtn.textContent = '▶';
    });
  }

  function getItemData(index) {
    const item = menuItems[index];
    if (!item) return null;
    return {
      title: item.getAttribute('data-title'),
      sub: item.getAttribute('data-sub'),
      desc: item.getAttribute('data-desc'),
      img: item.getAttribute('data-img')
    };
  }

  function updatePlayerBar(title, sub, img) {
    if (trackThumb) trackThumb.src = img;
    if (trackTitle) trackTitle.textContent = title;
    if (trackArtist) trackArtist.textContent = sub;
  }

  // Stage 1: Preview Card View
  function previewSection(index) {
    const idx = parseInt(index, 10);
    const data = getItemData(idx);
    if (!data) return;

    contentSections.forEach((section, sIdx) => {
      const preview = section.querySelector('.preview-card');
      const album = section.querySelector('.album-container');

      if (sIdx === idx) {
        section.style.display = 'block';
        section.classList.add('active');

        if (preview) {
          preview.style.display = 'flex';
          preview.style.backgroundImage = `url('${data.img}')`;
          const pTitle = preview.querySelector('.preview-title');
          const pDesc = preview.querySelector('.preview-desc');
          if (pTitle) pTitle.textContent = data.title;
          if (pDesc) pDesc.textContent = data.desc;
        }
        if (album) album.style.display = 'none';
      } else {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });

    updatePlayerBar(data.title, data.sub, data.img);
    if (playBtn) playBtn.textContent = '▶';
  }

  // Stage 2: Full Album View
  function navigateToAlbum(index) {
    selectedIndex = parseInt(index, 10);
    isFullView = true;
    activeTrackIdx = null; // All tracks start collapsed

    menuItems.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    contentSections.forEach((section, sIdx) => {
      const preview = section.querySelector('.preview-card');
      const album = section.querySelector('.album-container');

      if (sIdx === selectedIndex) {
        section.style.display = 'block';
        section.classList.add('active');

        if (preview) preview.style.display = 'none';
        if (album) album.style.display = 'block';

        const trackItems = section.querySelectorAll('.track-item');
        trackItems.forEach(t => t.classList.remove('expanded'));
      } else {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });

    const data = getItemData(selectedIndex);
    if (data) updatePlayerBar(data.title, data.sub, data.img);

    if (playBtn) playBtn.textContent = '▶';
  }

  // Expand track row & activate player state
  function expandTrack(sectionIdx, trackIdx) {
    const activeSection = document.getElementById(`section-${sectionIdx}`);
    if (!activeSection) return;

    const trackItems = activeSection.querySelectorAll('.track-item');
    if (!trackItems.length) return;

    activeTrackIdx = trackIdx;

    trackItems.forEach((item, idx) => {
      if (idx === trackIdx) {
        item.classList.add('expanded');
        const title = item.getAttribute('data-title');
        const sub = item.getAttribute('data-sub');
        const img = item.getAttribute('data-img');
        updatePlayerBar(title, sub, img);
      } else {
        item.classList.remove('expanded');
      }
    });

    if (playBtn) playBtn.textContent = '❚❚';
  }

  // Toggle single track collapse/expand
  function toggleTrack(item, sectionIdx, trackIdx) {
    const isAlreadyExpanded = item.classList.contains('expanded');

    if (isAlreadyExpanded) {
      item.classList.remove('expanded');
      activeTrackIdx = null;
      
      const data = getItemData(sectionIdx);
      if (data) updatePlayerBar(data.title, data.sub, data.img);
      if (playBtn) playBtn.textContent = '▶';
    } else {
      expandTrack(sectionIdx, trackIdx);
    }
  }

  // Sidebar Menu Events
  menuItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (isFullView) return;

      const index = item.getAttribute('data-index');
      hoverIndex = parseInt(index, 10);

      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      previewSection(hoverIndex);
    });

    item.addEventListener('mouseleave', () => {
      if (isFullView) return;

      hoverIndex = null;
      menuItems.forEach((i, idx) => {
        if (idx === selectedIndex) i.classList.add('active');
        else i.classList.remove('active');
      });

      previewSection(selectedIndex);
    });

    item.addEventListener('click', () => {
      const index = item.getAttribute('data-index');
      navigateToAlbum(index);
    });
  });

  // Track Click Handlers
  contentSections.forEach((section, sIdx) => {
    const trackItems = section.querySelectorAll('.track-item');
    trackItems.forEach((item, tIdx) => {
      item.addEventListener('click', () => {
        toggleTrack(item, sIdx, tIdx);
      });
    });

    const preview = section.querySelector('.preview-card');
    if (preview) {
      preview.addEventListener('click', () => {
        const targetIdx = hoverIndex !== null ? hoverIndex : selectedIndex;
        navigateToAlbum(targetIdx);
      });
    }
  });

  // Global Player Bar Button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!isFullView) {
        navigateToAlbum(selectedIndex);
      } else {
        if (activeTrackIdx !== null) {
          const activeSection = document.getElementById(`section-${selectedIndex}`);
          const trackItems = activeSection.querySelectorAll('.track-item');
          if (trackItems[activeTrackIdx]) {
            toggleTrack(trackItems[activeTrackIdx], selectedIndex, activeTrackIdx);
          }
        } else {
          expandTrack(selectedIndex, 0);
        }
      }
    });
  }

  // Previous Track Control
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (isFullView) {
        const activeSection = document.getElementById(`section-${selectedIndex}`);
        const trackItems = activeSection ? activeSection.querySelectorAll('.track-item') : [];
        if (trackItems.length > 0) {
          let newTrackIdx = activeTrackIdx === null || activeTrackIdx - 1 < 0 
            ? trackItems.length - 1 
            : activeTrackIdx - 1;
          expandTrack(selectedIndex, newTrackIdx);
        }
      } else {
        let newIdx = selectedIndex - 1 < 0 ? menuItems.length - 1 : selectedIndex - 1;
        selectedIndex = newIdx;
        previewSection(newIdx);
      }
    });
  }

  // Next Track Control
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isFullView) {
        const activeSection = document.getElementById(`section-${selectedIndex}`);
        const trackItems = activeSection ? activeSection.querySelectorAll('.track-item') : [];
        if (trackItems.length > 0) {
          let newTrackIdx = activeTrackIdx === null 
            ? 0 
            : (activeTrackIdx + 1) % trackItems.length;
          expandTrack(selectedIndex, newTrackIdx);
        }
      } else {
        let newIdx = (selectedIndex + 1) % menuItems.length;
        selectedIndex = newIdx;
        previewSection(newIdx);
      }
    });
  }

  // Initial Load
  previewSection(0);
});