// Ep18 压测脚本一：healthz（纯内存应答，不走认证/DB/LLM，是系统吞吐天花板）
// 运行：k6 run k6-healthz.js  （可用 BASE=http://localhost:8080 覆盖目标地址）
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    health: {
      executor: 'constant-arrival-rate',
      rate: 500, timeUnit: '1s', // 每秒固定到达 500 个请求，模拟真实流量形态
      duration: '30s',
      preAllocatedVUs: 100,      // 预分配虚拟用户，避免压测中途扩容抖动
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],   // 错误率 < 1%
    http_req_duration: ['p(95)<50'],  // 期望 P95 < 50ms
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE || 'http://localhost:8080'}/healthz`);
  check(res, { 'status 200': (r) => r.status === 200 });
}
