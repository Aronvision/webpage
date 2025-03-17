-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제
DROP POLICY IF EXISTS "사용자는 자신의 데이터만 볼 수 있음" ON users;
DROP POLICY IF EXISTS "사용자는 자신의 데이터만 업데이트할 수 있음" ON users;

-- 사용자가 자신의 데이터만 볼 수 있도록 정책 설정
CREATE POLICY "사용자는 자신의 데이터만 볼 수 있음" ON users
  FOR SELECT USING (auth.uid() = id);

-- 사용자가 자신의 데이터만 업데이트할 수 있도록 정책 설정
CREATE POLICY "사용자는 자신의 데이터만 업데이트할 수 있음" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 관리자 함수: 이메일과 비밀번호로 사용자 생성
CREATE OR REPLACE FUNCTION create_user(
  email TEXT,
  name TEXT,
  password TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (email, name, password)
  VALUES (email, name, crypt(password, gen_salt('bf')))
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자 함수: 이메일과 비밀번호로 사용자 인증
CREATE OR REPLACE FUNCTION authenticate_user(
  input_email TEXT,
  input_password TEXT
) RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name
  FROM users u
  WHERE u.email = input_email
  AND u.password = crypt(input_password, u.password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 