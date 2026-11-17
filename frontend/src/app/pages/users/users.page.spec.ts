import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UsersPage } from './users.page';

describe('UsersPage', () => {
  it('filters users by name, username, and active status', () => {
    const userService = jasmine.createSpyObj<UserService>('UserService', [
      'getUsers',
      'getUser',
      'createUser',
      'updateUser',
      'deleteUser'
    ]);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    const page = new UsersPage(userService, router);
    page.users = [
      { id: 1, firstName: 'María', lastName: 'López', username: 'mlopez', active: true, role: 'user' },
      { id: 2, firstName: 'Carlos', lastName: 'Díaz', username: 'cdiaz', active: false, role: 'user' }
    ];

    page.searchTerm = 'MARÍA';
    expect(page.filteredUsers.map((user) => user.username)).toEqual(['mlopez']);

    page.searchTerm = '';
    page.statusFilter = 'inactive';
    expect(page.filteredUsers.map((user) => user.username)).toEqual(['cdiaz']);
  });
});
