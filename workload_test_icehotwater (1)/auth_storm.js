import http from 'k6/http';
import { check, sleep } from 'k6';

const testType = __ENV.TEST_TYPE || 'smoke';

export let options = {
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1000'],
  },
};

switch (testType) {
  case 'smoke':
    options.stages = [
      { duration: '10s', target: 5 },
      { duration: '20s', target: 5 },
      { duration: '10s', target: 0 },
    ];
    break;
  case 'average':
    options.stages = [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 20 },
      { duration: '30s', target: 0 },
    ];
    break;
  case 'stress':
    options.stages = [
      { duration: '2m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 0 },
    ];
    break;
  case 'extreme':
    options.stages = [
      { duration: '2m', target: 200 },
      { duration: '3m', target: 500 },
      { duration: '5m', target: 1000 },
      { duration: '2m', target: 0 },
    ];
    break;
}

function exponentialDelay(rate) {
  const U = Math.random();
  return -Math.log(1 - U) / rate;
}

const BASE_AUTH = 'http://34.232.30.223:80/service-auth/api/auth';
const REGISTER_ENDPOINT = `${BASE_AUTH}/register`;
const LOGIN_ENDPOINT = `${BASE_AUTH}/login`;

function registerUser(vu) {
  const username = `user_${vu}`;
  const payload = JSON.stringify({
    username,
    password: 'Testpass1',
    email: `${username}@example.com`, // if your API requires email
    full_name: "Marketplace User",
    address: "Bogor, Washington DC, USA",
    phone_number: "420420420"
  });
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(REGISTER_ENDPOINT, payload, { headers });
  check(res, { 'register status 201': (r) => r.status === 201 || r.status === 500 }); 
  // 201 = created, 409 = conflict if user already exists (allow)
  return username;
}

export default function () {
  // Register once per VU (only on first iteration)
  if (__ITER === 0) {
    registerUser(__VU);
  }

  // Authentication storm
  const username = `user_${__VU}`;
  const isBadPassword = Math.random() < 0.1;
  const payload = JSON.stringify({
    username,
    password: isBadPassword ? 'WRONGPASS' : 'Testpass1',
  });
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(LOGIN_ENDPOINT, payload, { headers });

  check(res, {
    [`login ${isBadPassword ? 'fail' : 'success'}`]: (r) =>
      isBadPassword ? r.status !== 200 : r.status === 200,
  });

  // Sleep with Poisson arrival with lambda=3
  sleep(0.5);
  sleep(exponentialDelay(3));
}