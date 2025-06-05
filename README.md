# 공항 모빌리티 웹 서비스

이 저장소는 휠체어 형태의 안내 로봇을 위한 모바일·웹 서비스입니다. Next.js 14과 Tailwind CSS를 기반으로 하며, Supabase와 Next‑Auth를 이용한 사용자 인증, MQTT를 통한 로봇 제어, QR 코드 스캔 기능 등을 포함합니다.

## 주요 기능

- **사용자 인증**: 이메일/비밀번호 기반 로그인 및 회원가입을 지원합니다. 인증 정보는 Supabase에 저장되며 Next‑Auth로 세션을 관리합니다.
- **예약 및 즉시 사용**: 대시보드에서 빠른 예약을 생성하거나 QR 코드 스캔 후 즉시 로봇을 사용할 수 있습니다.
- **편의시설 검색**: Supabase에 저장된 시설 정보를 React Query로 불러와 터미널·층·카테고리별로 필터링할 수 있습니다.
- **실시간 안내**: MQTT(WebSocket)를 통해 로봇으로 목적지를 전송하고 도착 여부를 수신합니다.
- **지도 및 경로 안내**: 공항 지도를 기반으로 목적지 검색과 경로 시각화를 제공합니다.

## 설치 및 실행

필수 조건: Node.js 18 이상

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 <http://localhost:3002> 를 열면 애플리케이션을 확인할 수 있습니다.

### 환경 변수

다음 변수들을 `.env.local` 파일에 설정해야 합니다.

```env
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MQTT_BROKER_URL=ws://broker:9001
NEXT_PUBLIC_MQTT_USERNAME=username
NEXT_PUBLIC_MQTT_PASSWORD=password
```

## 프로젝트 구조

- `src/app` – 페이지와 라우트 정의
- `src/components` – 재사용 가능한 UI 컴포넌트
- `src/features` – 인증과 편의시설 등 도메인별 로직
- `src/lib` – Supabase 클라이언트, 인증 설정, 공용 유틸리티
- `docs/` – PRD와 IA 등 기획 및 디자인 문서

## 스크립트

- `npm run dev` – 개발 서버 실행
- `npm run build` – 프로덕션 빌드 생성
- `npm run start` – 빌드된 앱 실행

## 라이선스

MIT
