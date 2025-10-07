import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { getReceptions } from '../../services/receptionService'
import { CreditCard as Edit, Package } from 'lucide-react'

interface Reception {
  id: string
  reception_number: string
  reception_date: string
  counterparty_id: string
  counterparties: {
    id: string
    name: string
  }
}

export const Archive: React.FC = () => {
  const navigate = useNavigate()
  const [receptions, setReceptions] = useState<Reception[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReceptions()
  }, [])

  const loadReceptions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getReceptions()
      setReceptions(data as Reception[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приемок')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (receptionId: string) => {
    navigate(`/app/archive/${receptionId}`)
  }

  if (loading) {
    return (
      <AppLayout title="Архив Приемок">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Архив Приемок">
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {receptions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет сохраненных приемок</h3>
            <p className="text-gray-500 mb-6">
              Когда вы сохраните приемки, они появятся здесь
            </p>
            <Button onClick={() => navigate('/app/acceptance/new')}>
              Создать приемку
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер приемки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата приемки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контрагент
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receptions.map((reception) => (
                  <tr key={reception.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reception.reception_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reception.reception_date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reception.counterparties.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(reception.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
