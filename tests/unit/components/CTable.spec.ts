import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CTable from '@/components/CTable.vue'

describe('CTable.vue', () => {
  let wrapper: any

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 25 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 30 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 28 }
  ]

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'age', label: 'Age', sortable: true, type: 'number' }
  ]

  beforeEach(() => {
    wrapper = mount(CTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    })
  })

  it('renders table with correct structure', () => {
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('renders correct number of columns', () => {
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(mockColumns.length)
  })

  it('renders correct column headers', () => {
    const headers = wrapper.findAll('th')
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Email')
    expect(headers[2].text()).toBe('Age')
  })

  it('renders correct number of rows', () => {
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(mockData.length)
  })

  it('renders correct row data', () => {
    const firstRow = wrapper.find('tbody tr')
    const cells = firstRow.findAll('td')
    expect(cells[0].text()).toBe('John Doe')
    expect(cells[1].text()).toBe('john@example.com')
    expect(cells[2].text()).toBe('25')
  })

  it('handles empty data gracefully', async () => {
    await wrapper.setProps({ data: [] })
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1) // empty row message
    expect(wrapper.find('tbody tr td').text()).toContain('No data available')
  })

  it('handles loading state', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('emits row click event', async () => {
    const firstRow = wrapper.find('tbody tr')
    await firstRow.trigger('click')
    
    expect(wrapper.emitted('row-click')).toBeTruthy()
    expect(wrapper.emitted('row-click')[0]).toEqual([mockData[0]])
  })

  it('handles sortable columns', async () => {
    const nameHeader = wrapper.find('th')
    await nameHeader.trigger('click')
    
    expect(wrapper.emitted('sort')).toBeTruthy()
    expect(wrapper.emitted('sort')[0]).toEqual([{ column: 'name', direction: 'asc' }])
  })

  it('toggles sort direction on multiple clicks', async () => {
    const nameHeader = wrapper.find('th')
    await nameHeader.trigger('click')
    await nameHeader.trigger('click')
    
    expect(wrapper.emitted('sort')).toHaveLength(2)
    expect(wrapper.emitted('sort')[1]).toEqual([{ column: 'name', direction: 'desc' }])
  })

  it('applies custom column classes', async () => {
    const columnsWithClass = [
      { key: 'name', label: 'Name', class: 'text-left' },
      { key: 'email', label: 'Email', class: 'text-center' },
      { key: 'age', label: 'Age', class: 'text-right' }
    ]
    
    await wrapper.setProps({ columns: columnsWithClass })
    
    const cells = wrapper.find('tbody tr').findAll('td')
    expect(cells[0].classes()).toContain('text-left')
    expect(cells[1].classes()).toContain('text-center')
    expect(cells[2].classes()).toContain('text-right')
  })

  it('handles column formatting', async () => {
    const columnsWithFormat = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'age', label: 'Age', format: (value: number) => `${value} years` }
    ]
    
    await wrapper.setProps({ columns: columnsWithFormat })
    
    const ageCell = wrapper.find('tbody tr').findAll('td')[2]
    expect(ageCell.text()).toBe('25 years')
  })

  it('handles selectable rows', async () => {
    await wrapper.setProps({ selectable: true })
    
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(mockData.length + 1) // +1 for select all
  })

  it('handles select all functionality', async () => {
    await wrapper.setProps({ selectable: true })
    
    const selectAllCheckbox = wrapper.find('thead input[type="checkbox"]')
    await selectAllCheckbox.setChecked(true)
    
    expect(wrapper.emitted('selection-change')).toBeTruthy()
    expect(wrapper.emitted('selection-change')[0][0]).toHaveLength(mockData.length)
  })

  it('handles individual row selection', async () => {
    await wrapper.setProps({ selectable: true })
    
    const firstRowCheckbox = wrapper.find('tbody tr input[type="checkbox"]')
    await firstRowCheckbox.setChecked(true)
    
    expect(wrapper.emitted('selection-change')).toBeTruthy()
    expect(wrapper.emitted('selection-change')[0][0]).toEqual([mockData[0]])
  })

  it('applies zebra striping when enabled', async () => {
    await wrapper.setProps({ striped: true })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].classes()).toContain('even')
    expect(rows[1].classes()).toContain('odd')
  })

  it('applies hover effect when enabled', async () => {
    await wrapper.setProps({ hoverable: true })
    
    const firstRow = wrapper.find('tbody tr')
    expect(firstRow.classes()).toContain('hoverable')
  })

  it('handles custom cell content via slots', () => {
    const wrapperWithSlot = mount(CTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      slots: {
        'cell-name': '<template #cell-name="{ row }"><strong>{{ row.name }}</strong></template>'
      }
    })
    
    const nameCell = wrapperWithSlot.find('tbody tr td strong')
    expect(nameCell.text()).toBe('John Doe')
  })
})
