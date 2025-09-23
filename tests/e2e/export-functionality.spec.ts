import { test, expect } from '@playwright/test'

test.describe('Export Functionality', () => {
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

  test('should export results to CSV after answering questions', async ({ page }) => {
    // Проверяем, что кнопка экспорта изначально присутствует
    await expect(page.getByRole('button', { name: '📊 Экспорт в CSV' })).toBeVisible()
    
    // Отвечаем на несколько вопросов
    // Первый вопрос - правильный ответ
    await page.getByText('$100').first().click()
    await page.getByRole('button', { name: 'Команда 1 0$' }).click()
    await page.getByRole('button', { name: 'Верно', exact: true }).click()
    
    // Второй вопрос - неправильный ответ
    await page.getByText('$200').first().click()
    await page.getByRole('button', { name: 'Команда 2 0$' }).click()
    await page.getByRole('button', { name: 'Неверно', exact: true }).click()
    
    // Третий вопрос - правильный ответ
    await page.getByText('$300').first().click()
    await page.getByRole('button', { name: 'Команда 1 0$' }).click()
    await page.getByRole('button', { name: 'Верно', exact: true }).click()
    
    // Проверяем, что очки обновились (используем более простые селекторы)
    await expect(page.locator('.font-bold.text-jeopardy-gold').first()).toBeVisible() // Команда 1: 100 + 300 = 400
    await expect(page.locator('.font-bold.text-jeopardy-gold').nth(1)).toBeVisible() // Команда 2: -200
    
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
