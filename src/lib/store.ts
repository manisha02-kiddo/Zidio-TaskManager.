import { create } from 'zustand';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface StoreState {
  userRole: UserRole | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchUserRole: (user: User) => Promise<void>;
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useStore = create<StoreState>((set, get) => ({
  userRole: null,
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchUserRole: async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id,roles(id,name,permissions)')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Fetched User Role Data:', data); // Debugging
      console.log("Error (if any):", error);
      if (error) {
        console.error('Error fetching user role:', error);
        set({
          userRole: {
            id: 'default',
            name: 'user',
            permissions: ['view_tasks'],
          },
        });
        return;
      }

      if (data && data.roles) {

         const role = Array.isArray(data.roles) ? data.roles[0] : data.roles;
        set({
          userRole: {
            id: role.id,
            name: role.name,
            permissions: Array.isArray(role.permissions) ? role.permissions : [],
          },
        });
      } else {
        set({
          userRole: {
            id: 'default',
            name: 'user',
            permissions: ['view_tasks'],
          },
        });
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      set({
        userRole: {
          id: 'default',
          name: 'user',
          permissions: ['view_tasks'],
        },
      });
    }
  },

  fetchNotifications: async (userId: string) => {
    if (!userId) return;

    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data || [];
      const unreadCount = notifications.filter((n) => !n.read).length;

      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      set({ loading: false, notifications: [], unreadCount: 0 });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    if (!notificationId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
    }
  },

  hasPermission: (permission: string) => {
    const { userRole } = get();
    return userRole?.permissions?.includes(permission) ?? false;
  },
}));
