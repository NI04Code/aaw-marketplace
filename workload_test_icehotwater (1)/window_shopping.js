import http from 'k6/http';
import { check, sleep } from 'k6';
const testType = __ENV.TEST_TYPE || 'smoke';
export let options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
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
      { duration: '2m', target: 250 }, // Ramp up to 250 users over 2 minutes
      { duration: '2m', target: 500 }, // Ramp up to 500 users over the next 2 minutes
      { duration: '3m', target: 500 }, // Hold at 500 users for 3 minutes
      { duration: '2m', target: 0 }, // Ramp down to 0 users over 2 minutes
    ];
    break;
}
function exponentialDelay(rate) {
  const U = Math.random();
  return -Math.log(1 - U) / rate;
}

const AUTH = 'http://34.232.30.223:80/service-auth/api/auth';
const PRODUCT = 'http://34.232.30.223:80/service-product/api/product';
const CART = 'http://34.232.30.223:80/service-order/api/cart';

function login() {
  const creds = JSON.stringify({
    username: 'Testuser1',
    password: 'Testpass1',
  });
  const res = http.post(`${AUTH}/login`, creds, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'login 200': (r) => r.status === 200 });
  const token = res.json('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function () {
  /* Login */
  const authHeaders = login();
  sleep(0.5);

  /* Browse product list (halaman 1) */
  let res = http.get(`${PRODUCT}?page_number=1&page_size=10`, authHeaders);
  check(res, { 'product list 200': (r) => r.status === 200 });
  sleep(1);

  /* View cart, lalu refresh 2× */
  for (let i = 0; i < 3; i++) {
    res = http.get(CART, authHeaders);
    check(res, { [`cart view ${i}`]: (r) => r.status === 200 });
    sleep(1);
  }

  sleep(exponentialDelay(3));
}
