import '../app/globals.css'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: {
        phone: { name: 'Phone', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '834px', height: '1112px' } },
        laptop: { name: 'Laptop', styles: { width: '1366px', height: '768px' } },
      },
      defaultViewport: 'phone',
    },
  },
}

export default preview


