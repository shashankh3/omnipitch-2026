// Mock Supabase Client for MVP
// In a real scenario, this would use @supabase/supabase-js

export const supabase = {
  auth: {
    getUser: async () => {
      // Mock authenticated user
      return {
        data: {
          user: {
            id: 'usr_9921',
            email: 'fan_international@worldcup2026.org',
            role: 'authenticated'
          }
        },
        error: null
      };
    }
  },
  from: (table: string) => {
    return {
      select: async (_query?: string) => {
        console.log(`Mock DB Select from ${table}`);
        return { data: [], error: null };
      },
      insert: async (data: any) => {
        console.log(`Mock DB Insert into ${table}`, data);
        return { data: data, error: null };
      }
    };
  }
};
