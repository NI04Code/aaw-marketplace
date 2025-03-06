import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 virtual users
    { duration: '30s', target: 100 }, // Stay at 100 virtual users
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = 'http://localhost:3000'; // Change to your microservice URL

export default function () {
  let registerRes = http.post(`${BASE_URL}/register`, JSON.stringify({
    username: `user${Math.random()}`,
    email: `user${Math.random()}@test.com`,
    password: 'password123',
    full_name: 'Test User',
    address: '123 Test Street',
    phone_number: '1234567890'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(registerRes, {
    'Register success': (r) => r.status === 201,
  });

  let loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    username: 'testuser',
    password: 'password123'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'Login success': (r) => r.status === 200,
  });

  if (loginRes.status === 200) {
    let token = JSON.parse(loginRes.body).token;

    let verifyTokenRes = http.post(`${BASE_URL}/verify-token`, JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(verifyTokenRes, {
      'Token verified': (r) => r.status === 200,
    });

    let verifyAdminTokenRes = http.post(`${BASE_URL}/verify-admin-token`, JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(verifyAdminTokenRes, {
      'Admin Token verified': (r) => r.status === 200 || r.status === 403, // Handle case where user is not an admin
    });
  }

  sleep(1);
}
