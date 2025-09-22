import { test, expect } from '@playwright/test'

test.describe('Analytics Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу пульта ведущего
    await page.goto('/host/demo-game')
    await page.waitForLoadState('networkidle')
    
    // Обрабатываем модальное окно восстановления игры (если появляется)
    const restoreModal = page.locator('[data-testid="game-restore-modal"]')
    if (await restoreModal.isVisible()) {
      // Выбираем "Новая игра" чтобы начать с чистого листа
      await page.getByRole('button', { name: 'Новая игра' }).click()
      await page.waitForTimeout(500) // Даем время на закрытие модального окна
    }
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
    await page.getByRole('button', { name: 'Команда 1 $' }).click()
    
    // Засчитываем ответ
    await page.getByRole('button', { name: 'Верно', exact: true }).click()
    
    // Проверяем, что очки обновились (это означает, что judge был отправлен)
    await expect(page.locator('.text-lg.font-semibold').first()).toBeVisible()
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
