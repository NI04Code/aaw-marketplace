import http from "k6/http";
import { sleep } from "k6";
import { check } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

function sinusoidalVU(t, A, B, T) {
  return Math.max(0, Math.round(A * Math.sin(((2 * Math.PI) / T) * t) + B));
}

export const options = {
  stages: Array.from({ length: 10 }, (_, i) => ({
    duration: "1m",
    target: sinusoidalVU(i, 200, 100, 10),
  })),
};
// const BASE_URL = "http://34.232.30.223:80/service-auth";
// const PRODUCT_URL = "http://34.232.30.223:80/service-product";
// const ORDER_URL = "http://34.232.30.223:80/service-order";

const BASE_URL = "http://localhost:8001";
const PRODUCT_URL = "http://localhost:8003";
const ORDER_URL = "http://localhost:8004";

let vuToken = {};

export default function () {
  let token = vuToken[__VU];

  // Jika belum ada token untuk VU ini, lakukan register terlebih dahulu
  if (!token) {
    // Generate random username dan email
    const username = `user_${randomString(8)}`;
    const email = `${username}@example.com`;
    const password = "Password1";
    const full_name = `Test User ${randomString(4)}`;
    const address = `Jl. Test No. ${Math.floor(Math.random() * 100)}, Jakarta`;
    const phone_number = `08${Math.floor(Math.random() * 10000000000)}`;

    // Register user baru
    let registerRes = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({
        username: username,
        email: email,
        password: password,
        full_name: full_name,
        address: address,
        phone_number: phone_number
      }),
      { headers: { "Content-Type": "application/json" } }
    );

    let registerSuccess = check(registerRes, {
      "Register success": (r) => r.status === 201,
    });
    
    
    if (registerSuccess) {
      console.log(`✅ VU ${__VU} Register Success!`);
      
      // Setelah register berhasil, login untuk mendapatkan token
      let loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
          username: username,
          password: password,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      
      let loginSuccess = check(loginRes, {
        "Login success": (r) => r.status === 200,
      });
      
      if (loginSuccess) {
        try {
          token = JSON.parse(loginRes.body).token;
          vuToken[__VU] = token; // Simpan token untuk VU ini
          console.log(`✅ VU ${__VU} Login Success!`);
        } catch (e) {
          console.log(`❌ VU ${__VU} Failed to parse login response: ${e.message}`);
          return; // Hentikan eksekusi jika gagal parse response
        }
      } else {
        console.log(
          `❌ VU ${__VU} Login Failed! Status: ${loginRes.status} Response: ${loginRes.body}`
        );
        return; // Hentikan eksekusi jika login gagal
      }
    } else {
      console.log(
        `❌ VU ${__VU} Register Failed! Status: ${registerRes.status} Response: ${registerRes.body}`
      );
      return; // Hentikan eksekusi jika register gagal
    }
  }

  // Jika tidak ada token valid, hentikan eksekusi
  if (!token) {
    console.log(`❌ VU ${__VU} Skipping iteration due to missing token`);
    return;
  }

  let authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Simulasi browse produk
  if (Math.random() < 0.6) {
    http.get(`${PRODUCT_URL}/api/product/`);
  }

  // Simulasi sequence add to cart kemudian place order
  if (Math.random() < 0.2) {
    // Add to cart terlebih dahulu
    let addToCartRes = http.post(
      `${ORDER_URL}/api/cart/`,
      JSON.stringify({
        product_id: "ede5de68-eac7-4e7e-a4fb-c87a503e9730",
        quantity: 1,
      }),
      authHeaders
    );
    
    let addToCartSuccess = check(addToCartRes, { 
      "Added to cart": (r) => r.status === 201 
    });

    if (addToCartSuccess) {
      console.log(`✅ VU ${__VU} Add to Cart Success!`);
      
      // Place order hanya jika add to cart berhasil
      if (Math.random() < 0.8) { // 80% chance untuk melanjutkan ke place order
        let orderRes = http.post(
          `${ORDER_URL}/api/order/`,
          JSON.stringify({
            shipping_provider: "JNE",
          }),
          authHeaders
        );
        
        let orderSuccess = check(orderRes, { 
          "Order placed": (r) => r.status === 201 
        });

        if (orderSuccess) {
          console.log(`✅ VU ${__VU} Order Success!`);
        } else {
          console.log(
            `❌ VU ${__VU} Order Failed! Status: ${orderRes.status} Response: ${orderRes.body}`
          );
        }
      }
    } else {
      console.log(
        `❌ VU ${__VU} Add to Cart Failed! Status: ${addToCartRes.status} Response: ${addToCartRes.body}`
      );
    }
  }

  sleep(1);
}