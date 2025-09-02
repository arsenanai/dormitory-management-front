import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Messages from '@/pages/Messages.vue';
import { createI18n } from 'vue-i18n';

vi.mock('@/services/api', () => {
  return {
    messageService: {
      getAll: vi.fn().mockResolvedValue({ data: { data: [
        { id: 1, sender: { name: 'Admin' }, receiver: { name: 'Student' }, subject: 'Hello', content: 'Welcome', created_at: '2024-01-01T00:00:00Z' }
      ] } }),
      getMyMessages: vi.fn().mockResolvedValue({ data: { data: [
        { id: 2, sender: { name: 'Admin' }, receiver: { name: 'Me' }, subject: 'Note', content: 'Please read', created_at: '2024-01-02T00:00:00Z' }
      ] } }),
      markAsRead: vi.fn().mockResolvedValue({ data: { message: 'ok' } })
    },
    dormitoryService: { getAll: vi.fn().mockResolvedValue({ data: [] }) },
    roomService: { getAll: vi.fn().mockResolvedValue({ data: [] }) }
  };
});

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

describe('Messages.vue list', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test');
  });

  it('renders messages table with rows', async () => {
    const wrapper = mount(Messages, { global: { plugins: [i18n] } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="messages-table"]').exists()).toBe(true);
  });
});


