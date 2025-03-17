-- 편의시설 카테고리 ENUM 생성
CREATE TYPE facility_category AS ENUM (
  'cafe',
  'shop',
  'restaurant',
  'medical',
  'wifi',
  'phone',
  'babycare',
  'accessibility',
  'gate'
);

-- 편의시설 테이블 생성
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category facility_category NOT NULL,
  location TEXT NOT NULL,
  terminal TEXT NOT NULL,
  floor TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  description TEXT,
  operating_hours TEXT,
  phone TEXT,
  website TEXT,
  rating NUMERIC(3, 1),
  reviews INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX facilities_category_idx ON facilities (category);
CREATE INDEX facilities_terminal_idx ON facilities (terminal);
CREATE INDEX facilities_floor_idx ON facilities (floor);

-- 샘플 데이터 삽입
INSERT INTO facilities (name, category, location, terminal, floor, coordinates, description, operating_hours, phone, website, rating, reviews, images)
VALUES
  (
    '스타벅스', 
    'cafe', 
    '제1터미널 1층', 
    'T1', 
    '1F', 
    '{"x": 30, "y": 40}', 
    '스타벅스는 전 세계적으로 유명한 커피 체인점으로, 다양한 커피와 음료, 디저트를 제공합니다.', 
    '매일 06:00 - 22:00', 
    '02-1234-5678', 
    'https://www.starbucks.co.kr', 
    4.5, 
    120, 
    ARRAY['https://picsum.photos/800/600?1', 'https://picsum.photos/800/600?2', 'https://picsum.photos/800/600?3']
  ),
  (
    '롯데면세점', 
    'shop', 
    '제1터미널 3층', 
    'T1', 
    '3F', 
    '{"x": 50, "y": 60}', 
    '롯데면세점은 다양한 브랜드의 화장품, 패션, 주류, 담배 등을 면세로 판매하는 쇼핑 공간입니다.', 
    '매일 07:00 - 21:30', 
    '02-2345-6789', 
    'https://www.lottedfs.com', 
    4.3, 
    95, 
    ARRAY['https://picsum.photos/800/600?4', 'https://picsum.photos/800/600?5', 'https://picsum.photos/800/600?6']
  ),
  (
    '공항 의무실', 
    'medical', 
    '제1터미널 1층', 
    'T1', 
    '1F', 
    '{"x": 70, "y": 30}', 
    '공항 의무실은 여행객들을 위한 응급 의료 서비스를 제공합니다. 간단한 처치와 상담이 가능합니다.', 
    '24시간 운영', 
    '02-3456-7890', 
    '', 
    4.7, 
    32, 
    ARRAY['https://picsum.photos/800/600?7', 'https://picsum.photos/800/600?8']
  ),
  (
    '신세계면세점', 
    'shop', 
    '제1터미널 3층', 
    'T1', 
    '3F', 
    '{"x": 45, "y": 55}', 
    '신세계면세점은 다양한 명품 브랜드와 화장품, 주류 등을 판매하는 면세점입니다.', 
    '매일 07:00 - 21:00', 
    '02-4567-8901', 
    'https://www.ssgdfs.com', 
    4.4, 
    88, 
    ARRAY['https://picsum.photos/800/600?9', 'https://picsum.photos/800/600?10']
  ),
  (
    '파리바게트', 
    'cafe', 
    '제1터미널 2층', 
    'T1', 
    '2F', 
    '{"x": 35, "y": 45}', 
    '파리바게트는 다양한 빵과 케이크, 음료를 제공하는 베이커리 카페입니다.', 
    '매일 06:30 - 21:00', 
    '02-5678-9012', 
    'https://www.paris.co.kr', 
    4.2, 
    75, 
    ARRAY['https://picsum.photos/800/600?11', 'https://picsum.photos/800/600?12']
  ),
  (
    '본죽', 
    'restaurant', 
    '제1터미널 지하 1층', 
    'T1', 
    'B1', 
    '{"x": 60, "y": 25}', 
    '본죽은 건강한 한식 죽 전문점으로, 다양한 종류의 죽과 반찬을 제공합니다.', 
    '매일 07:00 - 21:00', 
    '02-6789-0123', 
    'https://www.bonif.co.kr', 
    4.1, 
    62, 
    ARRAY['https://picsum.photos/800/600?13', 'https://picsum.photos/800/600?14']
  ),
  (
    '맥도날드', 
    'restaurant', 
    '제1터미널 4층', 
    'T1', 
    '4F', 
    '{"x": 55, "y": 65}', 
    '맥도날드는 전 세계적으로 유명한 패스트푸드 체인으로, 햄버거와 감자튀김 등을 제공합니다.', 
    '매일 24시간 운영', 
    '02-7890-1234', 
    'https://www.mcdonalds.co.kr', 
    4.0, 
    110, 
    ARRAY['https://picsum.photos/800/600?15', 'https://picsum.photos/800/600?16']
  ),
  (
    '유아휴게실', 
    'babycare', 
    '제1터미널 2층', 
    'T1', 
    '2F', 
    '{"x": 40, "y": 50}', 
    '유아휴게실은 아기와 함께 여행하는 가족을 위한 공간으로, 수유실과 기저귀 교환대 등의 시설을 제공합니다.', 
    '매일 24시간 운영', 
    '', 
    '', 
    4.6, 
    45, 
    ARRAY['https://picsum.photos/800/600?17', 'https://picsum.photos/800/600?18']
  ),
  (
    '휠체어 대여소', 
    'accessibility', 
    '제1터미널 1층', 
    'T1', 
    '1F', 
    '{"x": 25, "y": 35}', 
    '휠체어 대여소는 교통약자를 위한 휠체어 대여 서비스를 제공합니다.', 
    '매일 24시간 운영', 
    '02-8901-2345', 
    '', 
    4.8, 
    38, 
    ARRAY['https://picsum.photos/800/600?19', 'https://picsum.photos/800/600?20']
  ),
  (
    '공중전화', 
    'phone', 
    '제1터미널 3층', 
    'T1', 
    '3F', 
    '{"x": 65, "y": 55}', 
    '공중전화는 국내 및 국제 전화를 걸 수 있는 공용 전화기입니다.', 
    '매일 24시간 운영', 
    '', 
    '', 
    4.0, 
    25, 
    ARRAY['https://picsum.photos/800/600?21']
  ),
  (
    '무료 와이파이존', 
    'wifi', 
    '제1터미널 전역', 
    'T1', 
    'ALL', 
    '{"x": 50, "y": 50}', 
    '무료 와이파이존은 공항 이용객들에게 무료 인터넷 접속 서비스를 제공합니다.', 
    '매일 24시간 운영', 
    '', 
    '', 
    4.2, 
    85, 
    ARRAY['https://picsum.photos/800/600?22']
  ),
  (
    'A1 게이트', 
    'gate', 
    '제1터미널 3층', 
    'T1', 
    '3F', 
    '{"x": 75, "y": 70}', 
    'A1 게이트는 국제선 출발을 위한 탑승구입니다.', 
    '항공편 일정에 따라 다름', 
    '', 
    '', 
    4.5, 
    60, 
    ARRAY['https://picsum.photos/800/600?23']
  ),
  (
    'B5 게이트', 
    'gate', 
    '제1터미널 3층', 
    'T1', 
    '3F', 
    '{"x": 80, "y": 75}', 
    'B5 게이트는 국제선 출발을 위한 탑승구입니다.', 
    '항공편 일정에 따라 다름', 
    '', 
    '', 
    4.4, 
    55, 
    ARRAY['https://picsum.photos/800/600?24']
  );

-- RLS 정책 설정 (모든 사용자가 읽기 가능)
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON facilities FOR SELECT USING (true); 