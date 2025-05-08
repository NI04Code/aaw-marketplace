import http from "k6/http";
import { sleep } from "k6";
import { check } from "k6";

function sinusoidalVU(t, A, B, T) {
  return Math.max(0, Math.round(A * Math.sin(((2 * Math.PI) / T) * t) + B));
}

export const options = {
  stages: Array.from({ length: 10 }, (_, i) => ({
    duration: "1m",
    target: sinusoidalVU(i, 2000, 1000, 10),
  })),
};

const BASE_URL = "http://localhost:8001";
const PRODUCT_URL = "http://localhost:8003";
const ORDER_URL = "http://localhost:8002";

let vuToken = {};

export default function () {
  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjllNDI1Y2I1LWM5ZjEtNGE5OS1iNGFiLWMwZThhZDAzNDRhOCIsInRlbmFudF9pZCI6IjQ3ZGQ2YjI0LTBiMjMtNDZiMC1hNjYyLTc3NjE1OGQwODliYSIsImlhdCI6MTc0MTA1MzQwOCwiZXhwIjoxNzQxMTM5ODA4fQ.coQuEpON3t1S0uWV2WIkNRyxFKcHu0kPAGyj5MRXn8k";

  //   if (!token) {
  //     let loginRes = http.post(
  //       `${BASE_URL}/auth/login`,
  //       JSON.stringify({
  //         username: "Marsupilamieue1",
  //         password: "Password1",
  //       }),
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     let loginSuccess = check(loginRes, {
  //       "Login success": (r) => r.status === 200,
  //     });

  //     if (loginSuccess) {
  //       token = JSON.parse(loginRes.body).token;
  //       vuToken[__VU] = token; // Simpan token untuk VU ini
  //       console.log(`✅ VU ${__VU} Login Success!`);
  //     } else {
  //       console.log(
  //         `❌ VU ${__VU} Login Failed! Status: ${loginRes.status} Response: ${loginRes.body}`
  //       );
  //       return; /
  //     }
  //   }

  let authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (Math.random() < 0.4) {
    http.get(`${PRODUCT_URL}/product/`);
  }

  if (Math.random() < 0.4) {
    let addToCartRes = http.post(
      `${ORDER_URL}/cart/`,
      JSON.stringify({
        product_id: "469bf3ec-3b76-474d-80e3-dee004eaa10b",
        quantity: 1,
      }),
      authHeaders
    );
    check(addToCartRes, { "Added to cart": (r) => r.status === 201 });

    if (addToCartRes.status === 201) {
      console.log(`✅ Add to Cart Success!`);
    } else {
      console.log(
        `❌ Add to Cart Failed! Status: ${addToCartRes.status} Response: ${addToCartRes.body}`
      );
    }
  }

  if (Math.random() < 0.3) {
    sleep(1);
    let orderRes = http.post(
      `${ORDER_URL}/order/`,
      JSON.stringify({
        shipping_provider: "JNE",
      }),
      authHeaders
    );
    check(orderRes, { "Order placed": (r) => r.status === 201 });

    if (orderRes.status === 201) {
      console.log(`✅ Order Success!`);
    } else {
      console.log(
        `❌ Order Failed! Status: ${orderRes.status} Response: ${orderRes.body}`
      );
    }
  }

  sleep(1);
}
