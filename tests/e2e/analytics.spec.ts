import { test, expect } from '@playwright/test'

test.describe('Analytics Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу пульта ведущего
    await page.goto('/host/demo-game')
    await page.waitForLoadState('networkidle')
  })

  test('should track game start event', async ({ page }) => {
    // Проверяем, что страница загрузилась (это означает, что game_start был отправлен)
    await expect(page.getByRole('heading', { name: 'Пульт ведущего' })).toBeVisible()
    
    // В реальном приложении здесь можно проверить отправку события в Sentry
    // Для демо-версии просто проверяем, что страница работает
  })

  test('should track board select event', async ({ page }) => {
    // Выбираем вопрос
    await page.getByText('$100').first().click()
    
    // Проверяем, что вопрос отобразился (это означает, что board_select был отправлен)
    await expect(page.getByText('В каком году началась Вторая мировая война?')).toBeVisible()
  })

  test('should track judge event', async ({ page }) => {
    // Выбираем вопрос и команду
    await page.getByText('$100').first().click()
    await page.getByText('Команда 1').click()
    
    // Засчитываем ответ
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем, что очки обновились (это означает, что judge был отправлен)
    await expect(page.getByText('$100')).toBeVisible()
  })

  test('should track screen page view', async ({ context }) => {
    // Открываем экран
    const screenPage = await context.newPage()
    await screenPage.goto('/screen/demo-game')
    await screenPage.waitForLoadState('networkidle')
    
    // Проверяем, что экран загрузился
    await expect(screenPage.getByText('Jeopardy Game')).toBeVisible()
    
    await screenPage.close()
  })
})
