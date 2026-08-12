import '@testing-library/jest-dom'
import i18n from './i18n'
import { applyDemoScenario } from './utils/demoScenario.utils'

void i18n.changeLanguage('fr')

localStorage.clear()
applyDemoScenario('none')

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
