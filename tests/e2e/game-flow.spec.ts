import { test, expect } from '@playwright/test'

test.describe('Jeopardy Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу пульта ведущего
    await page.goto('/host/demo-game')
    await page.waitForLoadState('networkidle')
  })

  test('should display game board with categories and questions', async ({ page }) => {
    // Проверяем заголовок
    await expect(page.getByRole('heading', { name: 'Пульт ведущего' })).toBeVisible()
    
    // Проверяем категории
    await expect(page.getByText('История')).toBeVisible()
    await expect(page.getByText('Наука')).toBeVisible()
    await expect(page.getByText('Спорт')).toBeVisible()
    await expect(page.getByText('Кино')).toBeVisible()
    await expect(page.getByText('География')).toBeVisible()
    
    // Проверяем вопросы
    await expect(page.getByText('$100')).toBeVisible()
    await expect(page.getByText('$200')).toBeVisible()
    await expect(page.getByText('$300')).toBeVisible()
    await expect(page.getByText('$400')).toBeVisible()
    await expect(page.getByText('$500')).toBeVisible()
  })

  test('should select question and display it', async ({ page }) => {
    // Кликаем на первый вопрос
    const firstQuestion = page.getByText('$100').first()
    await firstQuestion.click()
    
    // Проверяем, что вопрос отобразился
    await expect(page.getByText('$100')).toBeVisible()
    await expect(page.getByText('В каком году началась Вторая мировая война?')).toBeVisible()
    
    // Проверяем, что кнопка "Показать ответ" активна
    await expect(page.getByRole('button', { name: 'Показать ответ' })).toBeEnabled()
  })

  test('should show and hide answer', async ({ page }) => {
    // Выбираем вопрос
    await page.getByText('$100').first().click()
    
    // Показываем ответ
    await page.getByRole('button', { name: 'Показать ответ' }).click()
    
    // Проверяем, что ответ отобразился
    await expect(page.getByText('Ответ:')).toBeVisible()
    await expect(page.getByText('1939')).toBeVisible()
    
    // Проверяем, что кнопка изменилась на "Скрыть ответ"
    await expect(page.getByRole('button', { name: 'Скрыть ответ' })).toBeVisible()
    
    // Скрываем ответ
    await page.getByRole('button', { name: 'Скрыть ответ' }).click()
    
    // Проверяем, что ответ скрылся
    await expect(page.getByText('Ответ:')).not.toBeVisible()
    await expect(page.getByText('1939')).not.toBeVisible()
  })

  test('should select team and judge answer', async ({ page }) => {
    // Выбираем вопрос
    await page.getByText('$100').first().click()
    
    // Выбираем команду
    await page.getByText('Команда 1').click()
    
    // Проверяем, что команда выбрана (подсветка)
    const teamButton = page.getByText('Команда 1')
    await expect(teamButton).toHaveClass(/border-yellow-400/)
    
    // Проверяем, что кнопки судейства активны
    await expect(page.getByRole('button', { name: 'Верно' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Неверно' })).toBeEnabled()
    
    // Засчитываем как верный ответ
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем, что очки обновились
    await expect(page.getByText('$100')).toBeVisible() // Очки команды 1
    
    // Проверяем, что вопрос помечен как завершенный
    const completedQuestion = page.getByText('$100').first()
    await expect(completedQuestion).toHaveClass(/bg-gray-600/)
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Выбираем вопрос
    await page.getByText('$100').first().click()
    
    // Выбираем команду
    await page.getByText('Команда 1').click()
    
    // Тестируем горячую клавишу A (показать ответ)
    await page.keyboard.press('KeyA')
    await expect(page.getByText('Ответ:')).toBeVisible()
    
    // Тестируем горячую клавишу C (верно)
    await page.keyboard.press('KeyC')
    
    // Проверяем, что очки обновились
    await expect(page.getByText('$100')).toBeVisible()
  })

  test('should sync with screen page', async ({ page, context }) => {
    // Открываем экран в новой вкладке
    const screenPage = await context.newPage()
    await screenPage.goto('/screen/demo-game')
    await screenPage.waitForLoadState('networkidle')
    
    // На пульте выбираем вопрос
    await page.getByText('$100').first().click()
    
    // Проверяем, что на экране отобразился вопрос
    await expect(screenPage.getByText('$100')).toBeVisible()
    await expect(screenPage.getByText('В каком году началась Вторая мировая война?')).toBeVisible()
    
    // Показываем ответ на пульте
    await page.getByRole('button', { name: 'Показать ответ' }).click()
    
    // Проверяем, что ответ отобразился на экране
    await expect(screenPage.getByText('Ответ:')).toBeVisible()
    await expect(screenPage.getByText('1939')).toBeVisible()
    
    // Засчитываем ответ
    await page.getByText('Команда 1').click()
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем, что очки обновились на экране
    await expect(screenPage.getByText('$100')).toBeVisible()
    
    await screenPage.close()
  })

  test('should display scoreboard correctly', async ({ page }) => {
    // Проверяем начальные очки
    await expect(page.getByText('Команда 1')).toBeVisible()
    await expect(page.getByText('Команда 2')).toBeVisible()
    await expect(page.getByText('Команда 3')).toBeVisible()
    
    // Проверяем цветовые индикаторы
    const team1Indicator = page.locator('.bg-red-500').first()
    const team2Indicator = page.locator('.bg-blue-500').first()
    const team3Indicator = page.locator('.bg-green-500').first()
    
    await expect(team1Indicator).toBeVisible()
    await expect(team2Indicator).toBeVisible()
    await expect(team3Indicator).toBeVisible()
    
    // Проверяем начальные очки (должны быть $0)
    const scoreElements = page.locator('text=/$0/')
    await expect(scoreElements).toHaveCount(3)
  })

  test('should handle multiple questions and scoring', async ({ page }) => {
    // Отвечаем на первый вопрос правильно
    await page.getByText('$100').first().click()
    await page.getByText('Команда 1').click()
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем очки
    await expect(page.getByText('$100')).toBeVisible()
    
    // Отвечаем на второй вопрос неправильно
    await page.getByText('$200').first().click()
    await page.getByText('Команда 1').click()
    await page.getByRole('button', { name: 'Неверно' }).click()
    
    // Проверяем, что очки уменьшились
    await expect(page.getByText('$-100')).toBeVisible()
    
    // Отвечаем на третий вопрос правильно
    await page.getByText('$300').first().click()
    await page.getByText('Команда 2').click()
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем очки команды 2
    await expect(page.getByText('$300')).toBeVisible()
  })

  test('should prevent selecting completed questions', async ({ page }) => {
    // Отвечаем на вопрос
    await page.getByText('$100').first().click()
    await page.getByText('Команда 1').click()
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Пытаемся выбрать тот же вопрос снова
    const completedQuestion = page.getByText('$100').first()
    await completedQuestion.click()
    
    // Проверяем, что вопрос не отобразился (должен остаться placeholder)
    await expect(page.getByText('Выберите ячейку на поле')).toBeVisible()
  })

  test('should handle screen page display modes', async ({ page, context }) => {
    const screenPage = await context.newPage()
    await screenPage.goto('/screen/demo-game')
    await screenPage.waitForLoadState('networkidle')
    
    // Проверяем, что на экране отображается игровое поле
    await expect(screenPage.getByText('История')).toBeVisible()
    await expect(screenPage.getByText('Наука')).toBeVisible()
    
    // Выбираем вопрос на пульте
    await page.getByText('$100').first().click()
    
    // Проверяем, что на экране отобразился вопрос
    await expect(screenPage.getByText('В каком году началась Вторая мировая война?')).toBeVisible()
    
    // Засчитываем ответ
    await page.getByText('Команда 1').click()
    await page.getByRole('button', { name: 'Верно' }).click()
    
    // Проверяем, что на экране снова отображается игровое поле
    await expect(screenPage.getByText('История')).toBeVisible()
    
    await screenPage.close()
  })
})
