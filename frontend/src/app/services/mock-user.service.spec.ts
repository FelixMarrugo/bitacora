import { firstValueFrom } from 'rxjs';
import { MockUserService } from './mock-user.service';

describe('MockUserService', () => {
  let service: MockUserService;

  beforeEach(() => {
    localStorage.removeItem('bitacora.mock.users');
    service = new MockUserService();
  });

  it('creates, updates, authenticates, and deletes users without exposing their password', async () => {
    const initialUsers = await firstValueFrom(service.getUsers());
    expect(initialUsers[0].username).toBe('admin');

    const createdUser = await firstValueFrom(service.createUser({
      firstName: 'Ana',
      lastName: 'Pérez',
      username: 'ana',
      password: 'clave-segura',
      active: true
    }));
    expect(createdUser.username).toBe('ana');
    expect('passwordHash' in createdUser).toBeFalse();
    expect(localStorage.getItem('bitacora.mock.users')).not.toContain('clave-segura');

    const authenticatedUser = await firstValueFrom(service.authenticate('ana', 'clave-segura'));
    expect(authenticatedUser.id).toBe(createdUser.id);

    await firstValueFrom(service.updateUser(createdUser.id, { active: false }));
    await expectAsync(firstValueFrom(service.authenticate('ana', 'clave-segura'))).toBeRejected();

    await firstValueFrom(service.deleteUser(createdUser.id));
    const remainingUsers = await firstValueFrom(service.getUsers());
    expect(remainingUsers.map((user) => user.username)).toEqual(['admin']);
  });
});
