import http from 'k6/http';
import { check, sleep } from 'k6';

// Test user credentials (shared by all VUs)
const TEST_USER = {
  username: 'john_pork',
  password: 'String123',
};

// Store JWT tokens per VU
let vuToken = {};

// Sinusodial function
function generateSinusoidalStages(totalDuration, minVUs, peakVUs, numSteps) {
  let stages = [];
  let stepDuration = totalDuration / numSteps; // Each step's duration in seconds
  let midPoint = numSteps / 2; // Halfway point for peak

  for (let i = 0; i < numSteps; i++) {
    let vus = minVUs + Math.floor(
      ((peakVUs - minVUs) / 2) * (1 + Math.sin((Math.PI * (i - midPoint)) / midPoint))
    );

    stages.push({ duration: `${stepDuration}s`, target: vus });
  }

  return stages;
}

export function setup() {
  let res = http.get('http://localhost:8003/api/product');
  check(res, { 'Fetched product list': (r) => r.status === 200 });

  let productList = res.json().products.map(p => p.id); // Extract product IDs
  return { productList }; // Pass product list to VUs
}

// Define workload with different traffic per endpoint
export let options = {
  stages: generateSinusoidalStages(300, 100, 2000, 15)
};

// Function to log in and store JWT token
function login() {
  let res = http.post('http://localhost:8001/api/auth/login', JSON.stringify(TEST_USER), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'Login successful': (r) => r.status === 200 });

  vuToken[__VU] = res.json('token'); // Store token for this VU
  sleep(1);
}

// Function to get JWT token for the current VU
function getToken() {
  if (!vuToken[__VU]) {
    login(); // If token doesn't exist, log in again
  }
  return vuToken[__VU];
}

// Function to get all products
export function getAllProducts() {
  let res = http.get('http://localhost:8003/api/product', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  check(res, { 'Fetched products': (r) => r.status === 200 });
  sleep(1);
}

export function getProductsDetail(randomProductId) {
  let res = http.get(`http://localhost:8003/api/product/${randomProductId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  check(res, { 'Fetched products': (r) => r.status === 200 });
  sleep(1);
}

// 🔹 Function to add a product to the cart
export function addToCart(randomProductId) {
  let randomQuantity = Math.floor(Math.random() * 10) + 1;
  let res = http.post('http://localhost:8004/api/cart', JSON.stringify({
    product_id: `${randomProductId}`,
    quantity: randomQuantity,
  }), {
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  });

  check(res, { 'Added to cart': (r) => r.status === 200 });
  sleep(1);
}

// 🔹 Function to place an order
export function placeOrder() {
  let res = http.post('http://localhost:8004/api/order', JSON.stringify({
    shipping_provider: 'JNE',
  }), {
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  });

  check(res, { 'Order placed': (r) => r.status === 201 });
  sleep(1);
}


// 🔹 Main test function
export default function (data) {
  let products = data.productList;
  let randomProductId = products[Math.floor(Math.random() * products.length)];
  
  login();            // Each VU gets a token
  getAllProducts();   // Browse products
  getProductsDetail(randomProductId); // See Product details
  addToCart(randomProductId);        // Add to cart
  placeOrder();       // Checkout
}
