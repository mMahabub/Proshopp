// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder (required for Next.js imports in tests)
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request/Response for Next.js server actions (avoid Node.js compatibility issues)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.headers = new Map(Object.entries(init?.headers || {}))
    }

    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }

    async json() {
      return JSON.parse(this.body)
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Map
}

// Mock Stripe environment variables for tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_secret_key_for_testing'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  'pk_test_mock_publishable_key_for_testing'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_webhook_secret_for_testing'
