import { createClient } from "@/lib/supabase/server";

export interface RegisterUserParams {
  email: string;
  name: string;
  password: string;
}

/**
 * 새 사용자를 등록합니다.
 */
export async function registerUser({ email, name, password }: RegisterUserParams) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('create_user', {
      email,
      name,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, userId: data };
  } catch (error) {
    throw error;
  }
}

/**
 * 사용자 정보를 이메일로 조회합니다.
 */
export async function getUserByEmail(email: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * 사용자 정보를 ID로 조회합니다.
 */
export async function getUserById(id: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
} 