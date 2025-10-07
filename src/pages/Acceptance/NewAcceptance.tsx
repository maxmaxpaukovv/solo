import React, { useState } from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Download, Save } from 'lucide-react'
import { ReceptionExcelUploader } from '../../components/FinancialHierarchy/ReceptionExcelUploader'
import { ReceptionPreview } from '../../components/FinancialHierarchy/ReceptionPreview'
import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
import { saveReceptionData } from '../../services/receptionService'
import { Alert } from '../../components/ui/Alert'
import { AddWorkGroupModal } from '../../components/FinancialHierarchy/AddWorkGroupModal'
import { AddServiceModal } from '../../components/FinancialHierarchy/AddServiceModal'

export const NewAcceptance: React.FC = () => {
  const [receptionData, setReceptionData] = useState<ReceptionExcelRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [currentGroupName, setCurrentGroupName] = useState('')
  const [currentPositionNumber, setCurrentPositionNumber] = useState<number | null>(null)

  const handleDataUpload = (data: ReceptionExcelRow[]) => {
    setReceptionData(data)
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleSave = async () => {
    if (receptionData.length === 0) {
      setErrorMessage('Нет данных для сохранения')
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await saveReceptionData(receptionData)
      setSuccessMessage('Данные успешно сохранены в базу данных')
      setReceptionData([])
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка сохранения данных')
    } finally {
      setSaving(false)
    }
  }

  const handleAddGroupClick = () => {
    setCurrentPositionNumber(null)
    setShowAddGroupModal(true)
  }

  const handleAddItemToGroup = (positionNumber: number, workGroup: string) => {
    setCurrentPositionNumber(positionNumber)
    setCurrentGroupName(workGroup)
    setShowAddServiceModal(true)
  }

  const handleGroupNext = (groupName: string) => {
    setCurrentGroupName(groupName)
    setShowAddGroupModal(false)
    setShowAddServiceModal(true)
  }

  const handleServiceSave = (service: {
    name: string
    pricePerUnit: number
    quantity: number
    transactionType: 'Доходы' | 'Расходы'
  }) => {
    if (receptionData.length === 0) {
      setErrorMessage('Невозможно добавить группу работ. Сначала загрузите данные о приемке.')
      setShowAddServiceModal(false)
      setCurrentGroupName('')
      setCurrentPositionNumber(null)
      return
    }

    const targetPositionNumber = currentPositionNumber !== null
      ? currentPositionNumber
      : receptionData[0].positionNumber

    const positionItems = receptionData.filter(item => item.positionNumber === targetPositionNumber)
    if (positionItems.length === 0) {
      setErrorMessage('Не найдена позиция для добавления')
      setShowAddServiceModal(false)
      setCurrentGroupName('')
      setCurrentPositionNumber(null)
      return
    }

    const firstItem = positionItems[0]

    const newRow: ReceptionExcelRow = {
      receptionId: crypto.randomUUID(),
      receptionDate: firstItem.receptionDate,
      receptionNumber: firstItem.receptionNumber,
      counterpartyName: firstItem.counterpartyName,
      subdivisionName: firstItem.subdivisionName,
      positionNumber: targetPositionNumber,
      serviceName: firstItem.serviceName,
      itemName: service.name,
      workGroup: currentGroupName,
      transactionType: service.transactionType,
      price: service.pricePerUnit,
      quantity: service.quantity,
      motorInventoryNumber: firstItem.motorInventoryNumber,
    }

    setReceptionData([...receptionData, newRow])
    setShowAddServiceModal(false)
    setCurrentGroupName('')
    setCurrentPositionNumber(null)
    setSuccessMessage(`Добавлена новая позиция в группу "${currentGroupName}"`)
  }

  const handleDuplicatePosition = (positionNumber: number) => {
    const positionItems = receptionData.filter(item => item.positionNumber === positionNumber)

    if (positionItems.length === 0) return

    const maxPositionNumber = Math.max(...receptionData.map(item => item.positionNumber))
    const newPositionNumber = maxPositionNumber + 1

    const duplicatedItems = positionItems.map(item => ({
      ...item,
      receptionId: crypto.randomUUID(),
      positionNumber: newPositionNumber,
    }))

    setReceptionData([...receptionData, ...duplicatedItems])
    setSuccessMessage(`Позиция ${positionNumber} продублирована как позиция ${newPositionNumber}`)
  }

  const handleDeletePosition = (positionNumber: number) => {
    if (!confirm(`Вы уверены, что хотите удалить позицию ${positionNumber}? Это действие нельзя отменить.`)) {
      return
    }

    const newData = receptionData.filter(item => item.positionNumber !== positionNumber)
    setReceptionData(newData)
    setSuccessMessage(`Позиция ${positionNumber} успешно удалена`)
  }

  return (
    <AppLayout
      title="Новая Приемка"
      breadcrumbs={[
        { label: 'Приемка (Заказы)', path: '/app/acceptance' },
        { label: 'Новый Заказ', path: '/app/acceptance/new' },
      ]}
    >
      <div className="space-y-6">
        {successMessage && (
          <Alert variant="success">{successMessage}</Alert>
        )}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Собранные Позиции
            </h2>
            <ReceptionExcelUploader
              onDataUpload={handleDataUpload}
              setLoading={setLoading}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка данных...</p>
            </div>
          ) : (
            <ReceptionPreview
              data={receptionData}
              onDataChange={setReceptionData}
              onAddGroupClick={receptionData.length > 0 ? handleAddGroupClick : undefined}
              onDuplicatePosition={receptionData.length > 0 ? handleDuplicatePosition : undefined}
              onDeletePosition={receptionData.length > 0 ? handleDeletePosition : undefined}
              onAddItemToGroup={receptionData.length > 0 ? handleAddItemToGroup : undefined}
            />
          )}
        </div>

        {receptionData.length > 0 && (
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setReceptionData([])}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Сохранить позиции
                </>
              )}
            </Button>
          </div>
        )}

        <AddWorkGroupModal
          isOpen={showAddGroupModal}
          onClose={() => setShowAddGroupModal(false)}
          onNext={handleGroupNext}
        />

        <AddServiceModal
          isOpen={showAddServiceModal}
          onClose={() => {
            setShowAddServiceModal(false)
            setCurrentGroupName('')
            setCurrentPositionNumber(null)
          }}
          groupName={currentGroupName}
          onSave={handleServiceSave}
        />
      </div>
    </AppLayout>
  )
}
