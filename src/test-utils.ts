
// src/test-utils.ts
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// re-export everything from RTL
export * from '@testing-library/react'

// override render
export { render }

// export DOM helpers
export { screen, fireEvent, waitFor, act }
