import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  onSave: (service: {
    name: string
    pricePerUnit: number
    quantity: number
    transactionType: 'Доходы' | 'Расходы'
  }) => void
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  groupName,
  onSave,
}) => {
  const [serviceName, setServiceName] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [transactionType, setTransactionType] = useState<'Доходы' | 'Расходы'>('Расход')

  const handleSave = () => {
    if (serviceName.trim() && pricePerUnit > 0 && quantity > 0) {
      const finalPrice = transactionType === 'Расходы' ? -Math.abs(pricePerUnit) : Math.abs(pricePerUnit)
      onSave({
        name: serviceName.trim(),
        pricePerUnit: finalPrice,
        quantity,
        transactionType,
      })
      handleReset()
    }
  }

  const handleReset = () => {
    setServiceName('')
    setPricePerUnit(0)
    setQuantity(1)
    setTransactionType('Расход')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Новая позиция в группе "${groupName}"`}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название услуги/материала
          </label>
          <Input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Замена масла"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за ед. (в рублях)
            </label>
            <Input
              type="number"
              value={pricePerUnit || ''}
              onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
              placeholder="1500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество
            </label>
            <Input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="1"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип операции
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="Доходы"
                checked={transactionType === 'Доходы'}
                onChange={(e) => setTransactionType(e.target.value as 'Доходы' | 'Расходы')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Доход</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="Расходы"
                checked={transactionType === 'Расходы'}
                onChange={(e) => setTransactionType(e.target.value as 'Доходы' | 'Расходы')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Расход</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            Дополнительная информация (необязательно)
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!serviceName.trim() || pricePerUnit <= 0 || quantity <= 0}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  )
}
