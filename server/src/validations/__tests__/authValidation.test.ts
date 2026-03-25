import { signup } from '~/validations/authValidation';

describe('authValidation signup', () => {
	const validBody = {
		name: 'John Doe',
		email: 'john@example.com',
		password: 'password123'
	};

	it('accepts valid signup body', () => {
		const { error } = signup.body.validate(validBody);
		expect(error).toBeUndefined();
	});

	it('rejects short name', () => {
		const { error } = signup.body.validate({ ...validBody, name: 'J' });
		expect(error).toBeDefined();
		expect(error?.details[0].message).toMatch(/length/);
	});

	it('rejects invalid email', () => {
		const { error } = signup.body.validate({ ...validBody, email: 'not-an-email' });
		expect(error).toBeDefined();
	});

	it('rejects short password', () => {
		const { error } = signup.body.validate({ ...validBody, password: '12345' });
		expect(error).toBeDefined();
	});

	it('rejects missing required fields', () => {
		const { error } = signup.body.validate({});
		expect(error).toBeDefined();
	});
});
