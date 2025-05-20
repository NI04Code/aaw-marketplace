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

// const BASE='http://localhost:8002/api/product'; // service produk
const BASE = 'http://34.232.30.223:80/service-product/api/product'; // service produk

const PAGE_SIZE = 10; // ganti 10 / 50 / 100 sesuai uji
const MAX_PAGES = 5; // seberapa jauh “scroll”

export default function () {
  for (let p = 1; p <= MAX_PAGES; p++) {
    // request pertama (cold / cache‑miss)
    let res = http.get(`${BASE}?page_number=${p}&page_size=${PAGE_SIZE}`);
    check(res, { [`page ${p} 200`]: (r) => r.status === 200 });

    sleep(0.5);

    // request kedua (cache‑hit, latency harus turun)
    res = http.get(`${BASE}?page_number=${p}&page_size=${PAGE_SIZE}`);
    check(res, { [`page ${p} cached 200`]: (r) => r.status === 200 });
  }
  sleep(exponentialDelay(3));
}
