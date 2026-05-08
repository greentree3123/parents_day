# parents-day

어버이날 이벤트용 정적 웹페이지입니다.

- `index.html`: 부모님께 보여드릴 메인 페이지

## 사진 넣는 법

엄마아빠 폰에서도 같은 사진이 보이게 하려면 사진 파일을 `assets/photos` 안에 넣고 `data.js`에 경로를 적어주세요.

각 파트별 추천 폴더:

- `assets/photos/2026-now`: 2026 지금 이 순간
- `assets/photos/2024-2025-college`: 2024 - 2025 둘다 대학생이 된 시간
- `assets/photos/2022-2023-school`: 2022 - 2023 각자의 자리에서 빛나던 시간
- `assets/photos/2007-2021-childhood`: 2007 - 2021 미라재원이의 유년시절
- `assets/photos/2006-jaewon-first`: 2006 재원이와의 첫만남
- `assets/photos/2003-mira-first`: 2003 미라와의 첫만남
- `assets/photos/mom-message`: 엄마에게
- `assets/photos/dad-message`: 아빠에게
- `assets/photos/final-closing`: 마치며 사진

예시:

```js
{
  id: "ccc",
  photos: [
    "assets/photos/2024-2025-college/photo-1.jpg",
    "assets/photos/2024-2025-college/photo-2.jpg"
  ]
}
```

마지막 "마치며" 사진은 `assets/photos/final-closing/final.jpg`처럼 넣은 뒤 `data.js`의 `finalPhoto`에 경로를 적으면 됩니다.

```js
finalPhoto: "assets/photos/final-closing/final.jpg"
```

엄마/아빠 메시지에 기본 사진을 함께 배포하려면 `messagePhotos`에 경로를 적습니다.

```js
messagePhotos: {
  mom: ["assets/photos/mom-message/photo-1.jpg"],
  dad: ["assets/photos/dad-message/photo-1.jpg"]
}
```

음악을 함께 배포하려면 `assets/music` 폴더에 음악 파일을 넣고 `musicFile`에 경로를 적습니다.

```js
musicFile: "assets/music/background.mp3"
```

브라우저에서 직접 누르는 `사진 추가`와 `사진 넣기`도 가능하지만, 그 방식은 현재 기기에만 저장됩니다.
각 시간 카드 안의 `사진 여러 장 추가` 버튼은 한 번에 여러 장 선택할 수 있습니다.

## 실행하기

```powershell
node server.mjs
```

컴퓨터와 휴대폰이 같은 Wi-Fi에 연결되어 있으면 휴대폰에서 `http://컴퓨터IP:5173`으로 접속할 수 있습니다.

## 외부에서 접속하게 배포하기

이 저장소는 GitHub Pages로 배포할 수 있습니다. `master` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 정적 파일만 모아서 Pages에 올립니다.

배포 후 주소는 보통 아래 형태입니다.

```text
https://greentree3123.github.io/parents_day/
```

주의: 사이트 화면에서 직접 추가한 사진과 음악은 현재 기기 안에 저장됩니다. 외부에 있는 가족도 같은 사진과 음악을 보려면 파일을 `assets` 폴더에 넣고 `data.js`에 경로를 적어 함께 배포해야 합니다.
