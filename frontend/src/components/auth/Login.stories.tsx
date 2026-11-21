import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/test';
import { expect } from '@storybook/test';
import LoginForm from './Login';
import { AuthProvider } from '../../auth/AuthContext';
// Importación corregida para MSW v2
import { http } from 'msw';

// Metadata para el componente LoginForm
const meta = {
  title: 'Auth/Login Form',
  component: LoginForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        // Mock de un login exitoso.
        http.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              user: { username: 'testuser', id: '123' },
              token: 'mock-jwt-token-123',
              message: 'Login exitoso',
            })
          );
        }),
      ],
    },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia que muestra el estado de éxito.
export const LoginSuccessful: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Simular un login exitoso', async () => {
      // Ingresa el nombre de usuario y la contraseña
      await userEvent.type(canvas.getByPlaceholderText('Usuario'), 'testuser', { delay: 50 });
      await userEvent.type(canvas.getByPlaceholderText('Contraseña'), '123456', { delay: 50 });

      // Haz clic en el botón de "Iniciar sesión"
      await userEvent.click(canvas.getByRole('button', { name: /iniciar sesión/i }));

      // Espera y verifica el mensaje de éxito
      const successMessage = await canvas.findByText(/login exitoso/i, { timeout: 3000 });
      await expect(successMessage).toBeInTheDocument();
    });
  },
};

// Historia que muestra un login fallido.
export const LoginFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'Credenciales incorrectas o usuario bloqueado.' })
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Simular un login fallido', async () => {
      // Ingresa credenciales incorrectas
      await userEvent.type(canvas.getByPlaceholderText('Usuario'), 'usuario_incorrecto', { delay: 50 });
      await userEvent.type(canvas.getByPlaceholderText('Contraseña'), 'password_invalida', { delay: 50 });

      // Haz clic en el botón de "Iniciar sesión"
      await userEvent.click(canvas.getByRole('button', { name: /iniciar sesión/i }));

      // Espera y verifica el mensaje de error
      const errorMessage = await canvas.findByText(/credenciales incorrectas/i, { timeout: 3000 });
      await expect(errorMessage).toBeInTheDocument();
    });
  },
};

// Historia que muestra el estado de cargando.
export const LoginLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.delay(2000), // Simula una respuesta demorada
            ctx.status(200),
            ctx.json({
              user: { username: 'testuser', id: '123' },
              token: 'mock-jwt-token-123',
              message: 'Login exitoso',
            })
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Simular el estado de cargando', async () => {
      // Ingresa las credenciales
      await userEvent.type(canvas.getByPlaceholderText('Usuario'), 'testuser', { delay: 50 });
      await userEvent.type(canvas.getByPlaceholderText('Contraseña'), '123456', { delay: 50 });

      // Haz clic en el botón de "Iniciar sesión"
      await userEvent.click(canvas.getByRole('button', { name: /iniciar sesión/i }));

      // Espera y verifica que el texto del botón cambia a "Cargando..."
      const loadingButton = await canvas.findByText(/cargando.../i);
      await expect(loadingButton).toBeInTheDocument();
    });
  },
};
