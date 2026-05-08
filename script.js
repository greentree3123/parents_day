const appData = window.parentsDayData || {};
const timelineItems = appData.timelineItems || [];
const messages = appData.messages || {};

const modal = document.querySelector("#modal");
const modalKicker = document.querySelector("#modalKicker");
const modalTitle = document.querySelector("#modalTitle");
const modalBody = document.querySelector("#modalBody");
const photoCount = document.querySelector("#photoCount");
const photoGrid = document.querySelector("#photoGrid");
const photoInput = document.querySelector("#photoInput");
const addPhotoLabel = document.querySelector("#addPhotoLabel");
const musicInput = document.querySelector("#musicInput");
const backgroundMusic = document.querySelector("#backgroundMusic");
let activeTimelineId = "";
let photoDbPromise;

function readImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function openPhotoDb() {
  if (photoDbPromise) return photoDbPromise;
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not available."));
  }

  photoDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("parentsDayPhotoDb", 3);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("timelinePhotos")) {
        db.createObjectStore("timelinePhotos");
      }
      if (!db.objectStoreNames.contains("singlePhotos")) {
        db.createObjectStore("singlePhotos");
      }
      if (!db.objectStoreNames.contains("musicFiles")) {
        db.createObjectStore("musicFiles");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return photoDbPromise;
}

async function readPhotoStore(id) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("timelinePhotos", "readonly");
    const store = transaction.objectStore("timelinePhotos");
    const request = store.get(id);
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error);
  });
}

async function writePhotoStore(id, photos) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("timelinePhotos", "readwrite");
    const store = transaction.objectStore("timelinePhotos");
    const request = store.put(photos, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function readSinglePhoto(key) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("singlePhotos", "readonly");
    const store = transaction.objectStore("singlePhotos");
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || "");
    request.onerror = () => reject(request.error);
  });
}

async function writeSinglePhoto(key, src) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("singlePhotos", "readwrite");
    const store = transaction.objectStore("singlePhotos");
    const request = store.put(src, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function readMusicFile(key) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("musicFiles", "readonly");
    const store = transaction.objectStore("musicFiles");
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || "");
    request.onerror = () => reject(request.error);
  });
}

async function writeMusicFile(key, src) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("musicFiles", "readwrite");
    const store = transaction.objectStore("musicFiles");
    const request = store.put(src, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getStoredPhotos(id) {
  const legacyPhotos = JSON.parse(localStorage.getItem(`parentsDayPhotos:${id}`) || "[]");
  try {
    const photos = await readPhotoStore(id);
    if (legacyPhotos.length && !photos.length) {
      await writePhotoStore(id, legacyPhotos);
      localStorage.removeItem(`parentsDayPhotos:${id}`);
      return legacyPhotos;
    }
    return photos;
  } catch (error) {
    console.warn("사진 저장소를 열 수 없어 임시 저장소를 사용합니다.", error);
    return legacyPhotos;
  }
}

async function setStoredPhotos(id, photos) {
  try {
    await writePhotoStore(id, photos);
  } catch (error) {
    console.warn("IndexedDB 저장에 실패해 localStorage를 사용합니다.", error);
    try {
      localStorage.setItem(`parentsDayPhotos:${id}`, JSON.stringify(photos));
    } catch (fallbackError) {
      console.warn("사진 저장에 실패했습니다.", fallbackError);
      alert("사진 저장 공간이 부족해요. 사진을 조금 줄이거나 용량이 작은 사진으로 다시 시도해 주세요.");
      throw fallbackError;
    }
  }
}

async function getStoredSinglePhoto(key) {
  const legacySrc = localStorage.getItem(`parentsDaySingle:${key}`) || "";
  try {
    const src = await readSinglePhoto(key);
    if (legacySrc && !src) {
      await writeSinglePhoto(key, legacySrc);
      localStorage.removeItem(`parentsDaySingle:${key}`);
      return legacySrc;
    }
    return src;
  } catch (error) {
    console.warn("단일 사진 저장소를 열 수 없어 임시 저장소를 사용합니다.", error);
    return legacySrc;
  }
}

async function setStoredSinglePhoto(key, src) {
  try {
    await writeSinglePhoto(key, src);
  } catch (error) {
    console.warn("IndexedDB 단일 사진 저장에 실패해 localStorage를 사용합니다.", error);
    try {
      localStorage.setItem(`parentsDaySingle:${key}`, src);
    } catch (fallbackError) {
      console.warn("단일 사진 저장에 실패했습니다.", fallbackError);
      alert("사진 저장 공간이 부족해요. 용량이 작은 사진으로 다시 시도해 주세요.");
      throw fallbackError;
    }
  }
}

async function getStoredMusic() {
  const legacySrc = localStorage.getItem("parentsDayMusic") || "";
  try {
    const src = await readMusicFile("background");
    if (legacySrc && !src) {
      await writeMusicFile("background", legacySrc);
      localStorage.removeItem("parentsDayMusic");
      return legacySrc;
    }
    return src;
  } catch (error) {
    console.warn("음악 저장소를 열 수 없어 임시 저장소를 사용합니다.", error);
    return legacySrc;
  }
}

async function setStoredMusic(src) {
  try {
    await writeMusicFile("background", src);
  } catch (error) {
    console.warn("IndexedDB 음악 저장에 실패해 localStorage를 사용합니다.", error);
    try {
      localStorage.setItem("parentsDayMusic", src);
    } catch (fallbackError) {
      console.warn("음악 저장에 실패했습니다.", fallbackError);
      alert("음악 저장 공간이 부족해요. 용량이 작은 음악 파일로 다시 시도해 주세요.");
      throw fallbackError;
    }
  }
}

function getStaticPhotos(id) {
  const item = timelineItems.find((entry) => entry.id === id);
  return item && Array.isArray(item.photos) ? item.photos : [];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMultiline(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderTimeline() {
  const timeline = document.querySelector("#timeline");
  if (!timeline) return;

  timeline.innerHTML = timelineItems.map((item) => `
    <button class="time-card" type="button" style="--card-bg: ${item.color}" data-time="${item.id}">
      <span class="time-icon">${item.icon}</span>
      <span>
        <span class="timeline-title">${formatMultiline(item.title)}</span>
        <span class="timeline-subtitle">${formatMultiline(item.subtitle)}</span>
      </span>
      <span class="timeline-period">${item.period}</span>
      <span class="chevron">›</span>
    </button>
  `).join("");
}

async function renderPhotos(id) {
  const staticPhotos = getStaticPhotos(id);
  const storedPhotos = await getStoredPhotos(id);
  const photos = staticPhotos.concat(storedPhotos);
  if (photoCount) {
    photoCount.textContent = `사진 ${photos.length}장`;
  }

  if (!photos.length) {
    photoGrid.innerHTML = `
      <div class="empty-photos">
        <strong>사진을 기다리는 중</strong>
        <span>사진을 여러 장 추가하면 여기에 모여요.</span>
      </div>
    `;
    return;
  }

  photoGrid.innerHTML = photos.map((src, index) => {
    const storedIndex = index - staticPhotos.length;
    const canDelete = storedIndex >= 0;
    const canMovePrev = storedIndex > 0;
    const canMoveNext = storedIndex >= 0 && storedIndex < storedPhotos.length - 1;
    return `
    <figure class="photo-tile">
      <img src="${src}" alt="추억 사진">
      ${canDelete
        ? `<div class="photo-actions" aria-label="사진 순서 조정">
            <button class="move-photo" type="button" data-move-photo="${storedIndex}" data-direction="-1" aria-label="사진을 앞으로 이동" ${canMovePrev ? "" : "disabled"}>‹</button>
            <button class="move-photo" type="button" data-move-photo="${storedIndex}" data-direction="1" aria-label="사진을 뒤로 이동" ${canMoveNext ? "" : "disabled"}>›</button>
            <button class="delete-photo" type="button" data-delete-photo="${storedIndex}" aria-label="사진 삭제">×</button>
          </div>`
        : `<span class="static-photo-badge">기본 사진</span>`}
    </figure>
  `;
  }).join("");
}

async function deleteStoredPhoto(id, index) {
  const photos = await getStoredPhotos(id);
  if (index < 0 || index >= photos.length) return;
  photos.splice(index, 1);
  await setStoredPhotos(id, photos);
  await renderPhotos(id);
}

async function moveStoredPhoto(id, index, direction) {
  const photos = await getStoredPhotos(id);
  const nextIndex = index + direction;
  if (index < 0 || index >= photos.length || nextIndex < 0 || nextIndex >= photos.length) return;
  const [photo] = photos.splice(index, 1);
  photos.splice(nextIndex, 0, photo);
  await setStoredPhotos(id, photos);
  await renderPhotos(id);
}

async function openTimelineModal(item) {
  activeTimelineId = item.id;
  modalKicker.textContent = item.period;
  modalTitle.textContent = item.title;
  modalBody.textContent = item.body;
  addPhotoLabel.hidden = false;
  photoGrid.innerHTML = `
    <div class="empty-photos">
      <strong>사진을 불러오는 중</strong>
      <span>잠시만 기다려 주세요.</span>
    </div>
  `;
  modal.hidden = false;
  await renderPhotos(item.id);
}

async function openMessageModal(message, key) {
  if (!message) return;
  activeTimelineId = `message:${key}`;
  modalKicker.textContent = message.kicker;
  modalTitle.textContent = message.title;
  modalBody.textContent = message.body;
  addPhotoLabel.hidden = false;
  photoGrid.innerHTML = `
    <div class="empty-photos">
      <strong>사진을 불러오는 중</strong>
      <span>잠시만 기다려 주세요.</span>
    </div>
  `;
  modal.hidden = false;
  await renderPhotos(activeTimelineId);
}

function closeModal() {
  modal.hidden = true;
  activeTimelineId = "";
  if (photoInput) photoInput.value = "";
}

function setupModal() {
  if (!modal) return;

  document.addEventListener("click", async (event) => {
    const timeButton = event.target.closest("[data-time]");
    const messageButton = event.target.closest("[data-message]");

    if (timeButton) {
      const item = timelineItems.find((entry) => entry.id === timeButton.dataset.time);
      if (item) await openTimelineModal(item);
    }

    if (messageButton) {
      await openMessageModal(messages[messageButton.dataset.message], messageButton.dataset.message);
    }
  });

  photoGrid.addEventListener("click", async (event) => {
    const moveButton = event.target.closest("[data-move-photo]");
    if (moveButton && activeTimelineId) {
      await moveStoredPhoto(
        activeTimelineId,
        Number(moveButton.dataset.movePhoto),
        Number(moveButton.dataset.direction)
      );
      return;
    }

    const deleteButton = event.target.closest("[data-delete-photo]");
    if (!deleteButton || !activeTimelineId) return;
    await deleteStoredPhoto(activeTimelineId, Number(deleteButton.dataset.deletePhoto));
  });

  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  photoInput.addEventListener("change", async (event) => {
    if (!activeTimelineId) return;
    const files = Array.from(event.target.files || []);
    const loaded = await Promise.all(files.map(readImage));
    const nextPhotos = (await getStoredPhotos(activeTimelineId)).concat(loaded);
    await setStoredPhotos(activeTimelineId, nextPhotos);
    await renderPhotos(activeTimelineId);
    photoInput.value = "";
  });
}

async function handleSinglePhoto(input, key, imageId) {
  const file = input.files && input.files[0];
  if (!file) return;
  const src = await readImage(file);
  await setStoredSinglePhoto(key, src);
  await paintSinglePhoto(key, imageId);
}

async function paintSinglePhoto(key, imageId) {
  const configuredSrc = appData[`${key}Photo`] || "";
  const storedSrc = await getStoredSinglePhoto(key);
  const src = storedSrc || configuredSrc;
  const image = document.querySelector(`#${imageId}`);
  if (!image || !src) return;
  image.src = src;
  image.parentElement.classList.add("has-image");
}

function setupUploads() {
  const finalInput = document.querySelector("[data-final-photo]");
  if (finalInput) {
    paintSinglePhoto("final", "finalPhoto");
    finalInput.addEventListener("change", async () => {
      await handleSinglePhoto(finalInput, "final", "finalPhoto");
      finalInput.value = "";
    });
  }

  document.querySelectorAll("[data-page-photo]").forEach((input) => {
    const key = input.dataset.pagePhoto;
    const imageId = `${key}Photo`;
    paintSinglePhoto(key, imageId);
    input.addEventListener("change", async () => {
      await handleSinglePhoto(input, key, imageId);
      input.value = "";
    });
  });
}

function setupSoundButton() {
  const soundButton = document.querySelector(".sound-button");
  if (!soundButton || !backgroundMusic) return;

  getStoredMusic().then((src) => {
    if (!src) return;
    backgroundMusic.src = src;
    soundButton.classList.add("has-music");
    soundButton.setAttribute("aria-label", "음악 재생");
  });

  if (musicInput) {
    musicInput.addEventListener("change", async () => {
      const file = musicInput.files && musicInput.files[0];
      if (!file) return;
      const src = await readImage(file);
      await setStoredMusic(src);
      backgroundMusic.src = src;
      backgroundMusic.currentTime = 0;
      soundButton.classList.add("has-music");
      soundButton.textContent = "♬";
      soundButton.setAttribute("aria-label", "음악 일시정지");
      try {
        await backgroundMusic.play();
      } catch (error) {
        console.warn("음악 자동 재생이 차단되었습니다. 음악 버튼을 눌러 재생해 주세요.", error);
        soundButton.textContent = "♪";
        soundButton.setAttribute("aria-label", "음악 재생");
      }
      musicInput.value = "";
    });
  }

  soundButton.addEventListener("click", async () => {
    if (!backgroundMusic.src) {
      if (musicInput) musicInput.click();
      return;
    }

    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();
        soundButton.textContent = "♬";
        soundButton.setAttribute("aria-label", "음악 일시정지");
      } catch (error) {
        console.warn("음악을 재생할 수 없습니다.", error);
        alert("음악을 재생할 수 없어요. 다른 음악 파일로 다시 시도해 주세요.");
      }
      return;
    }

    backgroundMusic.pause();
    soundButton.textContent = "♪";
    soundButton.setAttribute("aria-label", "음악 재생");
  });
}

renderTimeline();
setupModal();
setupUploads();
setupSoundButton();
