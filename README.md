# parents-day

어버이날 이벤트용 정적 웹페이지입니다.

- `index.html`: 부모님께 보여드릴 메인 페이지

## 사진 넣는 법

엄마아빠 폰에서도 같은 사진이 보이게 하려면 사진 파일을 `assets/photos` 안에 넣고 `data.js`에 경로를 적어주세요.

각 파트별 추천 폴더:

- `assets/photos/now`: 2026 지금 이 순간
- `assets/photos/ccc`: 2024 - 2025 CCC
- `assets/photos/bbb`: 2022 - 2023 BBB
- `assets/photos/aaa`: 2007 - 2021 AAA
- `assets/photos/jaewon`: 2006 재원이와의 첫만남
- `assets/photos/mira`: 2003 미라와의 첫만남

예시:

```js
{
  id: "ccc",
  photos: [
    "assets/photos/ccc/photo-1.jpg",
    "assets/photos/ccc/photo-2.jpg"
  ]
}
```

마지막 "마치며" 사진은 `assets/photos/closing/final.jpg`처럼 넣은 뒤 `data.js`의 `finalPhoto`에 경로를 적으면 됩니다.

```js
finalPhoto: "assets/photos/closing/final.jpg"
```

브라우저에서 직접 누르는 `사진 추가`와 `사진 넣기`도 가능하지만, 그 방식은 현재 기기에만 저장됩니다.
각 시간 카드 안의 `사진 여러 장 추가` 버튼은 한 번에 여러 장 선택할 수 있습니다.

## 실행하기

```powershell
node server.mjs
```

컴퓨터와 휴대폰이 같은 Wi-Fi에 연결되어 있으면 휴대폰에서 `http://컴퓨터IP:5173`으로 접속할 수 있습니다.
