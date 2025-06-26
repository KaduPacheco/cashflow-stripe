
// src/test-utils.ts
import {
  render,
  act,
} from '@testing-library/react'

// re-export everything from RTL
export * from '@testing-library/react'

// override render
export { render }

// export explicitly other helpers that are available through re-export
export { act }
