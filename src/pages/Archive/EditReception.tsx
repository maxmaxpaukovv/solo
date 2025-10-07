import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import {
  getReceptionById,
  updateReceptionItem,
  deleteReceptionItem,
  addReceptionItem,
} from '../../services/receptionService'
import { ArrowLeft } from 'lucide-react'
import {
  EditableReceptionPreview,
  Reception,
  ReceptionItem,
} from '../../components/FinancialHierarchy/EditableReceptionPreview'

export const EditReception: React.FC = () => {
  const { receptionId } = useParams<{ receptionId: string }>()
  const navigate = useNavigate()
  const [reception, setReception] = useState<Reception | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReception()
  }, [receptionId])

  const loadReception = async () => {
    if (!receptionId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getReceptionById(receptionId)
      setReception(data as Reception)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приемки')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<ReceptionItem>) => {
    try {
      await updateReceptionItem(itemId, updates)
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления позиции')
      throw err
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteReceptionItem(itemId)
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции')
      throw err
    }
  }

  const handleAddItem = async (
    motorId: string,
    item: Omit<ReceptionItem, 'id' | 'upd_document_id'>
  ) => {
    try {
      await addReceptionItem(motorId, item)
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления позиции')
      throw err
    }
  }

  if (loading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка приемки...</div>
        </div>
      </AppLayout>
    )
  }

  if (!reception) {
    return (
      <AppLayout title="Ошибка">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Приемка не найдена</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`Редактирование приемки ${reception.reception_number}`}
      breadcrumbs={[
        { label: 'Архив', path: '/app/archive' },
        {
          label: `Приемка ${reception.reception_number}`,
          path: `/app/archive/${reception.id}`,
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/app/archive')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <EditableReceptionPreview
          reception={reception}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
        />
      </div>
    </AppLayout>
  )
}
