import type { Meta, StoryObj } from '@storybook/react'
import { BottomTabBar } from '../BottomTabBar'

const meta: Meta<typeof BottomTabBar> = {
  title: 'App/BottomTabBar',
  component: BottomTabBar,
}
export default meta

type Story = StoryObj<typeof BottomTabBar>

export const Default: Story = {
  args: {
    user: { id: 'story-user-id', email: 'user@example.com', name: 'Story User' },
  },
}


