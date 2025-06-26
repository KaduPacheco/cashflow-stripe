
// src/test-utils.ts
import { render, act, screen, fireEvent, waitFor } from '@testing-library/react'

// re-export everything from RTL
export * from '@testing-library/react'

// override render
export { render }

// export DOM helpers
export { screen, fireEvent, waitFor, act }
