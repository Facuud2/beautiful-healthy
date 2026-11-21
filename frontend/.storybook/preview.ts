// frontend/.storybook/preview.ts

import { initialize, mswLoader } from 'msw-storybook-addon';
// Importa el decorador del router
import { withRouter } from 'storybook-addon-remix-react-router';
import type { Preview } from '@storybook/react';

// Inicializa el mock de service worker
initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  loaders: [mswLoader],
  // Agrega el decorador del router aquí
  decorators: [withRouter],
};

export default preview;
