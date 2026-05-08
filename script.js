const timelineItems = [
  {
    id: "now",
    icon: "✉️",
    title: "지금 이 순간",
    subtitle: "현재의 감사함",
    period: "2026",
    color: "#fff1ec",
    body: "오늘의 마음을 가장 먼저 담는 자리예요. 지금 이 순간 부모님께 전하고 싶은 고마움을 사진과 함께 남겨보세요."
  },
  {
    id: "high",
    icon: "📚",
    title: "고등학교 시절",
    subtitle: "세상이 다 버겁게 느껴지던",
    period: "2018 - 2020",
    color: "#f8dce9",
    body: "힘들어도 버틸 수 있었던 건 언제나 뒤에서 믿어주던 부모님 덕분이었어요."
  },
  {
    id: "middle",
    icon: "🌱",
    title: "중학교 시절",
    subtitle: "야무지게 열심히 살았던",
    period: "2015 - 2017",
    color: "#ffe6d4",
    body: "하루하루 자라던 마음과 서툰 표현까지도 기다려준 시간이에요."
  },
  {
    id: "elementary",
    icon: "🖍️",
    title: "초등학교 시절",
    subtitle: "내 자아가 형성됐던 시기",
    period: "2009 - 2014",
    color: "#ffdcc0",
    body: "작은 일에도 울고 웃던 시절, 부모님의 손길이 제 세상의 기준이 되어주었어요."
  },
  {
    id: "baby",
    icon: "🌸",
    title: "유아기",
    subtitle: "기억은 없지만 사진 속엔 웃음뿐",
    period: "2004 - 2008",
    color: "#ffd9b8",
    body: "제가 기억하지 못하는 순간까지도 부모님은 다 기억하고 계시겠죠."
  },
  {
    id: "birth",
    icon: "🌙",
    title: "탄생",
    subtitle: "처음 나를 만났을 때",
    period: "2002 - 2003",
    color: "#ffe8b4",
    body: "처음 만난 날부터 지금까지, 저는 늘 부모님의 사랑 안에서 자랐어요."
  },
  {
    id: "pieces",
    icon: "💛",
    title: "기억의 조각들",
    subtitle: "엄마 아빠는 다 기억하겠죠",
    period: "모든 순간",
    color: "#fff0bf",
    body: "연도와 이름으로 다 담을 수 없는 조각들을 여기에 모아둘게요."
  }
];

const messages = {
  mom: {
    kicker: "엄마에게",
    title: "엄마, 고마워요",
    body: "늘 제 마음을 먼저 알아봐 주고, 말하지 않아도 품어줘서 고마워요. 엄마의 다정함이 제 안에 오래 남아 제가 더 따뜻한 사람이 될 수 있었어요."
  },
  dad: {
    kicker: "아빠에게",
    title: "아빠, 사랑해요",
    body: "묵묵히 제 곁을 지켜주고, 필요한 순간마다 든든한 버팀목이 되어줘서 고마워요. 아빠가 보여준 책임감과 사랑을 오래 기억할게요."
  }
};

const modal = document.querySelector("#modal");
const modalKicker = document.querySelector("#modalKicker");
const modalTitle = document.querySelector("#modalTitle");
const modalBody = document.querySelector("#modalBody");
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
  const photos = getStoredPhotos(id);
  photoGrid.innerHTML = photos.map((src) => `<img src="${src}" alt="추가한 추억 사진">`).join("");
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
  activeTimelineId = "";
  modalKicker.textContent = message.kicker;
  modalTitle.textContent = message.title;
  modalBody.textContent = message.body;
  addPhotoLabel.hidden = true;
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
  const src = localStorage.getItem(`parentsDaySingle:${key}`);
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
