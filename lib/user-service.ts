import { supabase } from './supabase';

export const userService = {
  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    if (error) throw error;
    return data;
  },

  async syncAllUsersToProfiles() {
    // Example: sync all users from localStorage to Supabase profiles table
    const usersRaw = localStorage.getItem('fomo-users');
    if (!usersRaw) return { success: false, message: 'No users in localStorage' };
    const users = JSON.parse(usersRaw);
    let successCount = 0;
    for (const userId in users) {
      const user = users[userId];
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        starSign: user.starSign,
        age: user.age,
      });
      if (!error) successCount++;
    }
    return { success: true, message: `Synced ${successCount} users.` };
  },
}; 