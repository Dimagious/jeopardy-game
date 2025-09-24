import React, { useState } from 'react'
import { PackImporter } from '../components/PackImporter'
import PackLibrary from '../components/PackLibrary'
import { QuestionPack } from '../shared/types/packTypes'

export default function PackManager() {
  const [activeTab, setActiveTab] = useState<'import' | 'library'>('import')
  const [selectedPack, setSelectedPack] = useState<QuestionPack | null>(null)


  const handlePackSelected = (pack: QuestionPack) => {
    setSelectedPack(pack)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление пакетами вопросов
          </h1>
          <p className="text-gray-600">
            Импортируйте, просматривайте и управляйте пакетами вопросов для игр Jeopardy
          </p>
        </div>

        {/* Вкладки */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Импорт
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Библиотека
          </button>
        </div>

        {/* Контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая колонка - Импорт или Библиотека */}
          <div>
            {activeTab === 'import' ? (
              <PackImporter 
                isOpen={true}
                onClose={() => {}}
                onImport={(packId, gameId) => console.log('Import:', packId, gameId)}
                availablePacks={[]}
                availableGames={[]}
                isLoading={false}
              />
            ) : (
              <PackLibrary onPackSelected={handlePackSelected} />
            )}
          </div>

          {/* Правая колонка - Предпросмотр выбранного пакета */}
          <div>
            {selectedPack ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Предпросмотр пакета</h2>
                
                <div className="mb-4">
                  <h3 className="font-medium text-lg">{selectedPack.title}</h3>
                  {selectedPack.description && (
                    <p className="text-gray-600 mt-1">{selectedPack.description}</p>
                  )}
                  {selectedPack.author && (
                    <p className="text-sm text-gray-500 mt-1">Автор: {selectedPack.author}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedPack.categories.length}
                    </div>
                    <div className="text-sm text-gray-600">Категорий</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPack.categories.reduce((sum, cat) => sum + cat.questions.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Вопросов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedPack.categories.reduce((sum, cat) => 
                        sum + cat.questions.reduce((catSum, q) => catSum + q.value, 0), 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Стоимость</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Категории и вопросы:</h4>
                  {selectedPack.categories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2">{category.name}</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {category.questions.map((question, qIndex) => (
                          <div key={qIndex} className="flex justify-between items-center text-sm">
                            <span className="font-medium">${question.value}</span>
                            <span className="text-gray-600 flex-1 mx-2 truncate">
                              {question.text}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {question.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Выберите пакет
                </h3>
                <p className="text-gray-600">
                  Выберите пакет из библиотеки или импортируйте новый, 
                  чтобы увидеть его предпросмотр здесь
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Информация о форматах */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Поддерживаемые форматы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">CSV формат</h4>
              <p className="text-blue-700 text-sm mb-2">
                Простой формат с колонками: Category, Value, Question, Answer
              </p>
              <div className="bg-white rounded p-3 text-xs font-mono text-gray-700">
                Category,Value,Question,Answer<br />
                "История",100,"В каком году...?","1939"<br />
                "Наука",200,"Сколько...?","206"
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">JSON формат</h4>
              <p className="text-blue-700 text-sm mb-2">
                Структурированный формат с метаданными и вложенными категориями
              </p>
              <div className="bg-white rounded p-3 text-xs font-mono text-gray-700">
                {`{
  "title": "Мой пакет",
  "categories": [{
    "name": "История",
    "questions": [{
      "value": 100,
      "text": "Вопрос?",
      "answer": "Ответ"
    }]
  }]
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
