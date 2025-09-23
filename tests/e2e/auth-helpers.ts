import { Page, expect } from '@playwright/test'

/**
 * Утилиты для аутентификации в E2E тестах
 * Работает с новой системой аутентификации через Supabase Magic Link
 */

// Типизация для мока Supabase в тестах
interface MockUser {
  id: string
  email: string
  user_metadata: {
    name?: string
  }
}

interface MockSession {
  user: MockUser
}

interface MockSupabaseAuth {
  getSession: () => Promise<{ data: { session: MockSession } | null; error: null }>
  onAuthStateChange: (callback: (event: string, session: MockSession) => void) => { data: { subscription: { unsubscribe: () => void } } }
}

interface MockSupabase {
  auth: MockSupabaseAuth
}

declare global {
  interface Window {
    supabase?: MockSupabase
  }
}

export interface TestUser {
  email: string
  name?: string
}

// Тестовый пользователь для E2E тестов
export const TEST_USER: TestUser = {
  email: 'test@example.com',
  name: 'Test User'
}

/**
 * Авторизация тестового пользователя
 * В тестовой среде мы мокаем Supabase Auth
 */
export async function loginTestUser(page: Page, user: TestUser = TEST_USER) {
  // Переходим на страницу входа
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  
  // Заполняем email
  await page.fill('input[name="email"]', user.email)
  
  // Нажимаем кнопку входа
  await page.click('button[type="submit"]')
  
  // Ждем сообщения об отправке ссылки
  await expect(page.locator('text=Проверьте вашу почту! Мы отправили ссылку для входа.')).toBeVisible()
  
  // В тестовой среде мы мокаем успешную авторизацию
  // В реальном приложении пользователь перешел бы по ссылке из email
  await mockSuccessfulAuth(page, user)
}

/**
 * Мокаем успешную авторизацию для тестов
 * В реальном приложении это происходило бы через Supabase Auth callback
 */
async function mockSuccessfulAuth(page: Page, user: TestUser) {
  // Мокаем Supabase Auth session
  await page.addInitScript((userData) => {
    // Мокаем Supabase client
    window.supabase = {
      auth: {
        getSession: () => Promise.resolve({
          data: {
            session: {
              user: {
                id: 'test-user-id',
                email: userData.email,
                user_metadata: {
                  name: userData.name || userData.email
                }
              }
            }
          },
          error: null
        }),
        onAuthStateChange: (callback: any) => {
          // Симулируем успешную авторизацию
          setTimeout(() => {
            callback('SIGNED_IN', {
              user: {
                id: 'test-user-id',
                email: userData.email,
                user_metadata: {
                  name: userData.name || userData.email
                }
              }
            })
          }, 100)
          return { data: { subscription: { unsubscribe: () => {} } } }
        }
      }
    }
  }, user)
  
  // Перезагружаем страницу для применения мока
  await page.reload()
  await page.waitForLoadState('networkidle')
  
  // Проверяем, что мы попали в админку
  await expect(page).toHaveURL(/\/admin/)
}

/**
 * Выход из системы
 */
export async function logout(page: Page) {
  // Ищем кнопку выхода в админке
  const logoutButton = page.locator('button:has-text("Выйти")')
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  }
  
  // Проверяем, что мы перенаправлены на страницу входа
  await expect(page).toHaveURL(/\/login/)
}

/**
 * Переход к игре после авторизации
 */
export async function navigateToGame(page: Page, gameId: string = 'demo-game') {
  // Переходим на страницу пульта ведущего
  await page.goto(`/host/${gameId}`)
  await page.waitForLoadState('networkidle')
  
  // Обрабатываем модальное окно восстановления игры (если появляется)
  const restoreModal = page.locator('[data-testid="game-restore-modal"]')
  if (await restoreModal.isVisible()) {
    // Выбираем "Новая игра" чтобы начать с чистого листа
    await page.getByRole('button', { name: 'Новая игра' }).click()
    await page.waitForTimeout(500) // Даем время на закрытие модального окна
  }
}

/**
 * Выбор режима игры (для совместимости со старыми тестами)
 */
export async function selectGameMode(page: Page, mode: 'jeopardy' | 'buzzer' = 'jeopardy') {
  // Проверяем, есть ли селектор режима игры
  const modeSelector = page.locator('[data-testid="game-mode-selector"]')
  
  if (await modeSelector.isVisible()) {
    const buttonText = mode === 'jeopardy' ? 'Выбрать Классический Jeopardy' : 'Выбрать Buzzer Mode'
    await expect(page.getByRole('button', { name: buttonText })).toBeVisible()
    await page.getByRole('button', { name: buttonText }).click()
    await page.waitForTimeout(500) // Даем время на переход
  }
}

/**
 * Полная настройка для теста игры
 */
export async function setupGameTest(page: Page, gameId: string = 'demo-game', mode: 'jeopardy' | 'buzzer' = 'jeopardy') {
  await loginTestUser(page)
  await navigateToGame(page, gameId)
  await selectGameMode(page, mode)
}
