import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Statistics from '@/pages/Statistics.vue'

// Mock the icons
vi.mock('@heroicons/vue/24/outline', () => ({
  HomeIcon: { template: '<svg></svg>' },
  BuildingOfficeIcon: { template: '<svg></svg>' },
  UserIcon: { template: '<svg></svg>' },
  UsersIcon: { template: '<svg></svg>' },
  ClipboardDocumentListIcon: { template: '<svg></svg>' },
  ChartPieIcon: { template: '<svg></svg>' },
  CurrencyDollarIcon: { template: '<svg></svg>' },
  NoSymbolIcon: { template: '<svg></svg>' },
  AcademicCapIcon: { template: '<svg></svg>' }
}))

// Mock Navigation component
vi.mock('@/components/CNavigation.vue', () => ({
  default: {
    name: 'Navigation',
    template: '<div class="navigation"><slot></slot></div>',
    props: ['title']
  }
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'Dashboard': 'Dashboard',
      'Number of dormitories': 'Number of dormitories',
      'Number of rooms': 'Number of rooms',
      'Total number of beds': 'Total number of beds',
      'Vacant beds': 'Vacant beds',
      'Registered students': 'Registered students',
      'Current presence in dormitory': 'Current presence in dormitory',
      'Meal paying students': 'Meal paying students',
      'Students without meal': 'Students without meal',
      'Number of quota students': 'Number of quota students'
    }
  }
})

describe('Statistics.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Statistics, {
      global: {
        plugins: [i18n]
      }
    })
  })

  it('renders statistics page correctly', () => {
    expect(wrapper.find('.navigation').exists()).toBe(true)
    expect(wrapper.text()).toContain('Number of dormitories')
    expect(wrapper.text()).toContain('Number of rooms')
  })

  it('displays correct number of statistics cards', () => {
    const cards = wrapper.findAll('[class*="bg-"]').filter((el: any) => 
      el.classes().some((cls: string) => cls.includes('bg-') && cls.includes('-50'))
    )
    expect(cards.length).toBeGreaterThan(5) // Should have multiple cards
  })

  it('displays statistics values', () => {
    expect(wrapper.text()).toContain('4') // Number of dormitories
    expect(wrapper.text()).toContain('268') // Number of rooms
    expect(wrapper.text()).toContain('1200') // Total number of beds
    expect(wrapper.text()).toContain('112') // Vacant beds
    expect(wrapper.text()).toContain('1088') // Registered students
  })

  it('displays statistics descriptions', () => {
    expect(wrapper.text()).toContain('Number of dormitories')
    expect(wrapper.text()).toContain('Number of rooms')
    expect(wrapper.text()).toContain('Total number of beds')
    expect(wrapper.text()).toContain('Vacant beds')
    expect(wrapper.text()).toContain('Registered students')
  })

  it('uses proper grid layout', () => {
    const gridContainer = wrapper.find('.grid')
    expect(gridContainer.exists()).toBe(true)
    expect(gridContainer.classes()).toContain('grid-cols-1')
    expect(gridContainer.classes()).toContain('sm:grid-cols-2')
    expect(gridContainer.classes()).toContain('lg:grid-cols-3')
  })

  it('applies correct styling to cards', () => {
    const cards = wrapper.findAll('.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
    
    cards.forEach((card: any) => {
      expect(card.classes()).toContain('rounded-lg')
      expect(card.classes()).toContain('shadow')
    })
  })
})
