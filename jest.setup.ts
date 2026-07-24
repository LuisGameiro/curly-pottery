import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from 'node:stream/web'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

if (typeof global.ReadableStream === 'undefined') {
  // @ts-expect-error Incompatible type between Node stream/web and DOM ReadableStream
  global.ReadableStream = ReadableStream
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream
}
if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error Incompatible type between Node stream/web and DOM TransformStream
  global.TransformStream = TransformStream
}

jest.mock('@/auth', () => ({
  __esModule: true,
  auth: jest.fn(),
}))

// Polyfill Web API globals needed by Next.js internal modules
// jsdom doesn't provide Request/Response/fetch, so we polyfill from Node.js
/* eslint-disable @typescript-eslint/no-require-imports */
if (typeof global.Request === 'undefined') {
  const undici = require('undici')
  global.Request = undici.Request
  global.Response = undici.Response
  global.Headers = undici.Headers
  global.fetch = undici.fetch
}
