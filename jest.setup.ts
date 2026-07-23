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
  // @ts-expect-error some errors here
  global.ReadableStream = ReadableStream
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream
}
if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error some errors here
  global.TransformStream = TransformStream
}

jest.mock('@/auth', () => ({
  __esModule: true,
  auth: jest.fn(),
}))

// Object.defineProperties(global, {
//   fetch: { value: fetch, writable: true },
//   Request: { value: Request, writable: true },
//   Response: { value: Response, writable: true },
//   Headers: { value: Headers, writable: true },
// });
