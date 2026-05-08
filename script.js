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
let activeTimelineId = "";

function readImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function getStoredPhotos(id) {
  return JSON.parse(localStorage.getItem(`parentsDayPhotos:${id}`) || "[]");
}

function setStoredPhotos(id, photos) {
  localStorage.setItem(`parentsDayPhotos:${id}`, JSON.stringify(photos));
}

function getStaticPhotos(id) {
  const item = timelineItems.find((entry) => entry.id === id);
  return item && Array.isArray(item.photos) ? item.photos : [];
}

function renderTimeline() {
  const timeline = document.querySelector("#timeline");
  if (!timeline) return;

  timeline.innerHTML = timelineItems.map((item) => `
    <button class="time-card" type="button" style="--card-bg: ${item.color}" data-time="${item.id}">
      <span class="time-icon">${item.icon}</span>
      <span>
        <span class="timeline-title">${item.title}</span>
        <span class="timeline-subtitle">${item.subtitle}</span>
      </span>
      <span class="timeline-period">${item.period}</span>
      <span class="chevron">›</span>
    </button>
  `).join("");
}

function renderPhotos(id) {
  const staticPhotos = getStaticPhotos(id);
  const storedPhotos = getStoredPhotos(id);
  const photos = staticPhotos.concat(storedPhotos);
  if (photoCount) {
    photoCount.textContent = `추억 사진 ${photos.length}장`;
  }

  if (!photos.length) {
    photoGrid.innerHTML = `
      <div class="empty-photos">
        <strong>사진을 기다리는 중</strong>
        <span>이 시절 사진을 여러 장 추가하면 여기에 모여요.</span>
      </div>
    `;
    return;
  }

  photoGrid.innerHTML = photos.map((src, index) => {
    const storedIndex = index - staticPhotos.length;
    const canDelete = storedIndex >= 0;
    return `
    <figure class="photo-tile">
      <img src="${src}" alt="추억 사진">
      ${canDelete
        ? `<button class="delete-photo" type="button" data-delete-photo="${storedIndex}" aria-label="사진 삭제">×</button>`
        : `<span class="static-photo-badge">기본 사진</span>`}
    </figure>
  `;
  }).join("");
}

function deleteStoredPhoto(id, index) {
  const photos = getStoredPhotos(id);
  if (index < 0 || index >= photos.length) return;
  photos.splice(index, 1);
  setStoredPhotos(id, photos);
  renderPhotos(id);
}

function openTimelineModal(item) {
  activeTimelineId = item.id;
  modalKicker.textContent = item.period;
  modalTitle.textContent = item.title;
  modalBody.textContent = item.body;
  addPhotoLabel.hidden = false;
  renderPhotos(item.id);
  modal.hidden = false;
}

function openMessageModal(message) {
  if (!message) return;
  activeTimelineId = "";
  modalKicker.textContent = message.kicker;
  modalTitle.textContent = message.title;
  modalBody.textContent = message.body;
  addPhotoLabel.hidden = true;
  if (photoCount) photoCount.textContent = "";
  photoGrid.innerHTML = "";
  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
  activeTimelineId = "";
  if (photoInput) photoInput.value = "";
}

function setupModal() {
  if (!modal) return;

  document.addEventListener("click", (event) => {
    const timeButton = event.target.closest("[data-time]");
    const messageButton = event.target.closest("[data-message]");

    if (timeButton) {
      const item = timelineItems.find((entry) => entry.id === timeButton.dataset.time);
      if (item) openTimelineModal(item);
    }

    if (messageButton) {
      openMessageModal(messages[messageButton.dataset.message]);
    }
  });

  photoGrid.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-photo]");
    if (!deleteButton || !activeTimelineId) return;
    deleteStoredPhoto(activeTimelineId, Number(deleteButton.dataset.deletePhoto));
  });

  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  photoInput.addEventListener("change", async (event) => {
    if (!activeTimelineId) return;
    const files = Array.from(event.target.files || []);
    const loaded = await Promise.all(files.map(readImage));
    const nextPhotos = getStoredPhotos(activeTimelineId).concat(loaded);
    setStoredPhotos(activeTimelineId, nextPhotos);
    renderPhotos(activeTimelineId);
    photoInput.value = "";
  });
}

async function handleSinglePhoto(input, key, imageId) {
  const file = input.files && input.files[0];
  if (!file) return;
  const src = await readImage(file);
  localStorage.setItem(`parentsDaySingle:${key}`, src);
  paintSinglePhoto(key, imageId);
}

function paintSinglePhoto(key, imageId) {
  const configuredSrc = appData[`${key}Photo`] || "";
  const storedSrc = localStorage.getItem(`parentsDaySingle:${key}`);
  const src = configuredSrc || storedSrc;
  const image = document.querySelector(`#${imageId}`);
  if (!image || !src) return;
  image.src = src;
  image.parentElement.classList.add("has-image");
}

function setupUploads() {
  const finalInput = document.querySelector("[data-final-photo]");
  if (finalInput) {
    paintSinglePhoto("final", "finalPhoto");
    finalInput.addEventListener("change", () => handleSinglePhoto(finalInput, "final", "finalPhoto"));
  }

  document.querySelectorAll("[data-page-photo]").forEach((input) => {
    const key = input.dataset.pagePhoto;
    const imageId = `${key}Photo`;
    paintSinglePhoto(key, imageId);
    input.addEventListener("change", () => handleSinglePhoto(input, key, imageId));
  });
}

function setupSoundButton() {
  const soundButton = document.querySelector(".sound-button");
  if (!soundButton) return;
  soundButton.addEventListener("click", () => {
    soundButton.textContent = soundButton.textContent === "♪" ? "♬" : "♪";
  });
}

renderTimeline();
setupModal();
setupUploads();
setupSoundButton();
