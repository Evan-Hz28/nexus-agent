// Ep18 压测脚本二：login（查库 + bcrypt 密码校验，是 CPU 重操作）
// 运行前确认 teacher 账号已注册（ep01 注册流程），否则全部 401。
// 注意：只压 /healthz 和 /login，绝对不要压 /chat/stream（烧钱 + 上游限流 + 熔断打开）。
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    login: {
      executor: 'constant-arrival-rate',
      rate: 50, timeUnit: '1s', // 每秒固定到达 50 次登录
      duration: '30s',
      preAllocatedVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'], // 登录含 bcrypt，P95 阈值放宽到 500ms
  },
};

export default function () {
  const res = http.post(`${__ENV.BASE || 'http://localhost:8080'}/api/v1/auth/login`,
    JSON.stringify({ username: 'admin', password: 'admin123' }),
    { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'status 200': (r) => r.status === 200 });
}
