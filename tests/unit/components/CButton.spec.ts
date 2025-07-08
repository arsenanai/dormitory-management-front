import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CButton from '@/components/CButton.vue'

describe('CButton.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CButton, {
      props: {
        label: 'Test Button'
      }
    })
  })

  it('renders button with correct label', () => {
    expect(wrapper.find('button').text()).toBe('Test Button')
  })

  it('renders button content via slot', () => {
    wrapper = mount(CButton, {
      slots: {
        default: '<span>Slot Content</span>'
      }
    })
    
    expect(wrapper.find('button span').text()).toBe('Slot Content')
  })

  it('emits click event when clicked', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('handles disabled state', async () => {
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').classes()).toContain('disabled')
  })

  it('handles loading state', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('handles different button types', async () => {
    await wrapper.setProps({ type: 'submit' })
    expect(wrapper.find('button').attributes('type')).toBe('submit')
    
    await wrapper.setProps({ type: 'reset' })
    expect(wrapper.find('button').attributes('type')).toBe('reset')
  })

  it('handles variant styles', async () => {
    await wrapper.setProps({ variant: 'primary' })
    expect(wrapper.find('button').classes()).toContain('primary')
    
    await wrapper.setProps({ variant: 'secondary' })
    expect(wrapper.find('button').classes()).toContain('secondary')
    
    await wrapper.setProps({ variant: 'danger' })
    expect(wrapper.find('button').classes()).toContain('danger')
  })

  it('handles size variants', async () => {
    await wrapper.setProps({ size: 'small' })
    expect(wrapper.find('button').classes()).toContain('small')
    
    await wrapper.setProps({ size: 'large' })
    expect(wrapper.find('button').classes()).toContain('large')
  })

  it('handles icon placement', async () => {
    await wrapper.setProps({ icon: 'plus', iconPosition: 'left' })
    expect(wrapper.find('.icon-left').exists()).toBe(true)
    
    await wrapper.setProps({ iconPosition: 'right' })
    expect(wrapper.find('.icon-right').exists()).toBe(true)
  })

  it('handles outline style', async () => {
    await wrapper.setProps({ outline: true })
    expect(wrapper.find('button').classes()).toContain('outline')
  })

  it('handles block style', async () => {
    await wrapper.setProps({ block: true })
    expect(wrapper.find('button').classes()).toContain('block')
  })

  it('handles rounded style', async () => {
    await wrapper.setProps({ rounded: true })
    expect(wrapper.find('button').classes()).toContain('rounded')
  })

  it('does not emit click when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    await wrapper.setProps({ loading: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('handles custom classes', async () => {
    await wrapper.setProps({ class: 'custom-class' })
    expect(wrapper.find('button').classes()).toContain('custom-class')
  })

  it('handles tooltip', async () => {
    await wrapper.setProps({ tooltip: 'Button tooltip' })
    expect(wrapper.find('button').attributes('title')).toBe('Button tooltip')
  })

  it('handles keyboard events', async () => {
    await wrapper.find('button').trigger('keydown.enter')
    expect(wrapper.emitted('keydown')).toBeTruthy()
    
    await wrapper.find('button').trigger('keydown.space')
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('handles focus and blur events', async () => {
    await wrapper.find('button').trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
    
    await wrapper.find('button').trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('handles confirmation dialog', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await wrapper.setProps({ confirm: 'Are you sure?' })
    
    await wrapper.find('button').trigger('click')
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure?')
    expect(wrapper.emitted('click')).toBeTruthy()
    
    confirmSpy.mockRestore()
  })

  it('cancels click when confirmation is denied', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await wrapper.setProps({ confirm: 'Are you sure?' })
    
    await wrapper.find('button').trigger('click')
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure?')
    expect(wrapper.emitted('click')).toBeFalsy()
    
    confirmSpy.mockRestore()
  })
})
