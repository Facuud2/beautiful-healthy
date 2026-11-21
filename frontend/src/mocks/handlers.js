import { http } from 'msw';
import { HttpResponse } from 'msw';

const mockUser = {
  id: 1,
  username: 'vmontes',
  email: 'valeria.montes@consultoriomontes.ar',
  token: 'clinical-jwt-token-recoleta-480',
};

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();

    if ((username === 'vmontes' || username === 'usuario') && password === '123') {
      return HttpResponse.json({
        user: mockUser,
        token: mockUser.token,
        message: 'Sesión clínica iniciada',
      }, { status: 200 });
    }
    return HttpResponse.json(
      { message: 'Credenciales incorrectas' },
      { status: 401 }
    );
  }),

  // Mock GET /patients
  http.get('/api/v1/pacientes', () => {
    const patients = [
      {
        id: 1,
        firstName: 'Lucía',
        lastName: 'Fernández',
        dni: '34892104',
        medicalRecordId: 'HC-2026-014',
        birthDate: '1989-04-12',
        gender: 'F',
        email: 'lucia.fernandez@arnet.com.ar',
      },
      {
        id: 2,
        firstName: 'Martín',
        lastName: 'Echeverría',
        dni: '29410885',
        medicalRecordId: 'HC-2026-019',
        birthDate: '1982-09-23',
        gender: 'M',
        email: 'm.echeverria@fibertel.com.ar',
      },
    ];
    return HttpResponse.json({ patients }, { status: 200 });
  }),
];