import { create, findOne } from '../models/User';

describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = await create({
      name: 'Hash Test',
      email: 'hash@example.com',
      password: 'plainpassword',
    });

    expect(user.password).not.toBe('plainpassword');
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should match correct password', async () => {
    const user = await create({
      name: 'Match Test',
      email: 'match@example.com',
      password: 'mypassword123',
    });

    // Need to re-fetch with password selected
    const userWithPass = await findOne({ email: 'match@example.com' }).select('+password');
    const isMatch = await userWithPass.matchPassword('mypassword123');
    expect(isMatch).toBe(true);

    const isWrong = await userWithPass.matchPassword('wrongpass');
    expect(isWrong).toBe(false);
  });

  it('should require name, email and password', async () => {
    let error;
    try {
      await create({ name: 'Incomplete' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });
});
