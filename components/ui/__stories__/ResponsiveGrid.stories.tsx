import type { Meta, StoryObj } from '@storybook/react'
import { ResponsiveGrid } from '../ResponsiveGrid'

const meta: Meta<typeof ResponsiveGrid> = {
  title: 'UI/ResponsiveGrid',
  component: ResponsiveGrid,
}
export default meta

type Story = StoryObj<typeof ResponsiveGrid>

export const Basic: Story = {
  render: () => (
    <div className="p-4">
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-100 border border-gray-200" />
        ))}
      </ResponsiveGrid>
    </div>
  ),
}


