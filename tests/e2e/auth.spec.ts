import { test, expect } from '@playwright/test'
import { loginTestUser, logout, TEST_USER } from './auth-helpers'

test.describe('Authentication Flow', () => {
  test('should redirect to login page when not authenticated', async ({ page }) => {
    // Переходим на защищенную страницу без авторизации
    await page.goto('/admin')
    
    // Должны быть перенаправлены на страницу входа
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Jeopardy Game' })).toBeVisible()
  })

  test('should show login form with email input', async ({ page }) => {
    await page.goto('/login')
    
    // Проверяем элементы формы входа
    await expect(page.getByRole('heading', { name: 'Jeopardy Game' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Получить ссылку для входа' })).toBeVisible()
  })

  test('should handle login process', async ({ page }) => {
    await page.goto('/login')
    
    // Заполняем email
    await page.fill('input[name="email"]', TEST_USER.email)
    
    // Нажимаем кнопку входа
    await page.click('button[type="submit"]')
    
    // Проверяем сообщение об отправке ссылки
    await expect(page.locator('text=Проверьте вашу почту! Мы отправили ссылку для входа.')).toBeVisible()
  })

  test('should authenticate user and redirect to admin', async ({ page }) => {
    // Выполняем полный процесс авторизации
    await loginTestUser(page)
    
    // Проверяем, что мы попали в админку
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByRole('heading', { name: 'Админка организации' })).toBeVisible()
  })

  test('should show user information in admin panel', async ({ page }) => {
    await loginTestUser(page)
    
    // Проверяем информацию о пользователе
    await expect(page.getByText(`Добро пожаловать, ${TEST_USER.name || TEST_USER.email}!`)).toBeVisible()
    
    // Проверяем информацию об организации
    await expect(page.getByText('Информация об организации')).toBeVisible()
  })

  test('should allow logout', async ({ page }) => {
    await loginTestUser(page)
    
    // Нажимаем кнопку выхода
    await logout(page)
    
    // Проверяем, что мы перенаправлены на страницу входа
    await expect(page).toHaveURL(/\/login/)
  })

  test('should protect host page without authentication', async ({ page }) => {
    // Пытаемся перейти на страницу пульта без авторизации
    await page.goto('/host/demo-game')
    
    // Должны быть перенаправлены на страницу входа
    await expect(page).toHaveURL(/\/login/)
  })

  test('should allow access to host page after authentication', async ({ page }) => {
    await loginTestUser(page)
    
    // Переходим на страницу пульта
    await page.goto('/host/demo-game')
    
    // Проверяем, что страница загрузилась (может показать модальное окно или селектор режима)
    await page.waitForLoadState('networkidle')
    
    // Страница должна загрузиться без перенаправления на login
    expect(page.url()).toContain('/host/demo-game')
  })
})
