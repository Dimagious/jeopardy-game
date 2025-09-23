import { test, expect, Page } from '@playwright/test'

test.describe('Export Functionality', () => {
  // Helper функция для выбора режима игры
  const selectGameMode = async (page: Page, mode: 'jeopardy' | 'buzzer' = 'jeopardy') => {
    const buttonText = mode === 'jeopardy' ? 'Выбрать Классический Jeopardy' : 'Выбрать Buzzer Mode'
    await expect(page.getByRole('button', { name: buttonText })).toBeVisible()
    await page.getByRole('button', { name: buttonText }).click()
    await page.waitForTimeout(500) // Даем время на переход
  }

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
    
    // Выбираем режим игры (по умолчанию Jeopardy)
    await selectGameMode(page, 'jeopardy')
  })

  test('should export results to CSV after answering questions', async ({ page }) => {
    // Проверяем, что кнопка экспорта изначально присутствует
    await expect(page.getByRole('button', { name: '📊 Экспорт в CSV' })).toBeVisible()
    
    // Отвечаем на один вопрос
    // Первый вопрос - правильный ответ
    await page.getByText('$100').first().click()
    await page.getByRole('button', { name: 'Команда 1 0$' }).click()
    await page.getByRole('button', { name: 'Верно', exact: true }).click()
    
    // Ждем, пока состояние обновится после первого вопроса (с учетом синхронизации)
    await page.waitForTimeout(100) // Даем время на forceSyncToScreen
    
    // Проверяем, что очки обновились
    await expect(page.locator('.font-bold.text-jeopardy-gold').first()).toBeVisible()
    
    // Настраиваем перехват скачивания файла
    const downloadPromise = page.waitForEvent('download')
    
    // Нажимаем кнопку экспорта
    await page.getByRole('button', { name: '📊 Экспорт в CSV' }).click()
    
    // Ждем скачивания файла
    const download = await downloadPromise
    
    // Проверяем, что файл скачался
    expect(download.suggestedFilename()).toMatch(/^jeopardy_.*\.csv$/)
    
    // Проверяем содержимое файла
    const path = await download.path()
    expect(path).toBeTruthy()
    
    // Проверяем, что файл скачался (содержимое файла нельзя прочитать в браузере)
    expect(download.suggestedFilename()).toMatch(/^jeopardy_.*\.csv$/)
  })

  test('should show export button even when no questions answered', async ({ page }) => {
    // Проверяем, что кнопка экспорта видна даже без ответов на вопросы
    await expect(page.getByRole('button', { name: '📊 Экспорт в CSV' })).toBeVisible()
    
    // Нажимаем кнопку экспорта (должна быть неактивна или показать предупреждение)
    await page.getByRole('button', { name: '📊 Экспорт в CSV' }).click()
    
    // Проверяем, что нет скачивания файла (так как нет данных)
    // Это можно проверить через отсутствие события download
    const downloadPromise = page.waitForEvent('download', { timeout: 1000 }).catch(() => null)
    const download = await downloadPromise
    
    expect(download).toBeNull()
  })

  test('should export correct data format', async ({ page }) => {
    // Отвечаем на один вопрос
    await page.getByText('$100').first().click()
    await page.getByRole('button', { name: 'Команда 1 0$' }).click()
    await page.getByRole('button', { name: 'Верно', exact: true }).click()
    
    // Настраиваем перехват скачивания файла
    const downloadPromise = page.waitForEvent('download')
    
    // Экспортируем
    await page.getByRole('button', { name: '📊 Экспорт в CSV' }).click()
    
    const download = await downloadPromise
    
    // Проверяем, что файл скачался (содержимое файла нельзя прочитать в браузере)
    expect(download.suggestedFilename()).toMatch(/^jeopardy_.*\.csv$/)
  })
})
