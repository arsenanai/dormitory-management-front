import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CFileLink from '@/components/CFileLink.vue';

describe('CFileLink.vue', () => {
  const VITE_API_BASE_URL = '/api'; // Matching vitest.config.ts

  it('renders nothing when no file path is provided', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: null,
      },
    });
    expect(wrapper.html()).not.toContain('a');
    expect(wrapper.find('label').exists()).toBe(true); // Label should still show
  });

  it('renders a link with the correct href when a file path is provided', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: 'student_files/document.pdf',
      },
    });

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    
    // VITE_API_BASE_URL is /api, so we expect /storage/student_files/document.pdf
    // The backend should symlink public/storage to storage/app/public
    const expectedHref = `/storage/student_files/document.pdf`;
    expect(link.attributes('href')).toBe(expectedHref);
  });

  it('displays the correct file name from the path', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: 'student_files/a_very_long_document_name.pdf',
      },
    });

    const link = wrapper.find('a');
    expect(link.text()).toBe('a_very_long_document_name.pdf');
  });

  it('renders the label correctly', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'My Awesome Document',
        filePath: 'files/test.jpg',
      },
    });

    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('My Awesome Document');
    expect(label.attributes('for')).toBe('test-link-wrapper');
  });

  it('sets download and target attributes on the link', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: 'student_files/report.pdf',
      },
    });

    const link = wrapper.find('a');
    expect(link.attributes('download')).toBe('report.pdf');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
  });

  it('handles file paths with multiple slashes correctly', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: 'uploads/2024/05/report.pdf',
      },
    });

    const link = wrapper.find('a');
    expect(link.text()).toBe('report.pdf');
    expect(link.attributes('href')).toBe('/storage/uploads/2024/05/report.pdf');
    expect(link.attributes('download')).toBe('report.pdf');
  });

  it('renders an icon inside the link wrapper', () => {
    const wrapper = mount(CFileLink, {
      props: {
        id: 'test-link',
        label: 'Document',
        filePath: 'files/test.jpg',
      },
    });

    // Check for an SVG icon, assuming it's from heroicons
    const icon = wrapper.find('svg');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('h-8');
    expect(icon.classes()).toContain('w-8');
  });
});