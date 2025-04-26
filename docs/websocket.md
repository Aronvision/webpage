# 로봇 내비게이션 웹 아키텍처

---

## 1. End‑to‑End 흐름

```text
① 사용자 모바일 브라우저에서 QR 코드 스캔
          │  (HTTP POST / fetch)
          ▼
② Node.js API 서버(클라우드) → "안내 시작" 요청 수신
          │  WS / MQTT 명령 전송
          ▼
③ 로봇 NUC ▷ Nav2 주행 시작
          │  ROS 토픽 퍼블리시 (/odom, /path, /tf…)
          ▼  (WebSocket 9090)
④ rosbridge_websocket (NUC)
          │  WebSocket
          ▼
⑤ 브라우저 roslibjs – 실시간 데이터 구독 및 시각화
```

---

## 2. 구성 요소 및 역할

| 구성 요소 | 주요 역할 | 사용 기술 |
|-----------|-----------|-----------|
| **모바일 브라우저** | QR 스캔, 명령 전송, 실시간 경로 시각화 | JavaScript, QR 스캐너, **roslibjs**, Leaflet/Three.js |
| **Node.js 서버** | REST API(`/api/start_navigation`), 로봇 명령 중계 | Express, WebSocket/MQTT |
| **로봇 NUC** | Nav2 실행, 센서/경로 데이터 퍼블리시 | Ubuntu + ROS Humble, WebSocket 클라이언트 |
| **rosbridge_websocket** | WebSocket ↔ ROS2 브리지 | `rosbridge_server` 패키지 |
| **ROS2 시스템** | 센서 처리, Nav2 플래너, TF 브로드캐스트 | Nav2, 센서 드라이버 노드 |

---

## 3. 단계별 구현 가이드

### 3‑1 QR 인식 & 로봇 식별
```js
const data = await scanQRCode();          // robotId 추출
fetch(`/api/start_navigation?robotId=${data.robotId}`);
```

### 3‑2 API 서버 → 로봇 명령 전송
```js
io.to(robotId).emit('start', { goal: [x, y] });
```

### 3‑3 로봇 NUC 측 처리 예시(Node.js)
```js
socket.on('start', ({ goal }) => {
  exec(`ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {position: {x: ${goal[0]}, y: ${goal[1]}, z: 0.0}}}"`);
});
```

### 3‑4 실시간 경로 전송
- NUC 에서 `/odom`, `/path`, `/tf` 토픽을 퍼블리시
- rosbridge_websocket (포트 9090)으로 브라우저에 전달

### 3‑5 브라우저 시각화(Leaflet 예)
```js
const odom = new ROSLIB.Topic({ ros, name: '/odom', messageType: 'nav_msgs/Odometry' });
odom.subscribe(msg => {
  const { x, y } = msg.pose.pose.position;
  robotMarker.setLatLng([y, x]);
});
```

---

## 4. 필수 기술 스택

- **Frontend** : roslibjs (토픽 pub/sub), Leaflet.js 또는 Three.js
- **Backend** : Node.js + Express (REST) / Socket.IO (WebSocket)
- **Robot** : ROS2 Humble + Nav2 + rosbridge_server
- **통신** : WebSocket(9090), MQTT(옵션)

---

## 5. 배포 및 네트워크 체크리스트

1. NUC 부팅 시 `rosbridge_websocket` 자동 실행 (systemd)
2. NUC → 클라우드 서버 WebSocket 클라이언트로 항시 등록
3. 브라우저 → NUC 직접 접속 시, NUC IP 공개 or 포워딩 필요
4. HTTPS (SSL/TLS) 적용하여 WS가 WSS로 통신하도록 설정
5. 실시간 데이터 전송 대역폭 테스트 (/camera/image_raw 등 고용량 주제 주의)

---

> **TIP:** 센서 데이터 구독량이 많을 때는 `/compressed` 이미지 토픽 사용, 주행 경로는 `/path` 대신 `/nav_msgs/Path` 를 down‑sample 해서 전송하면 트래픽을 줄일 수 있습니다.

