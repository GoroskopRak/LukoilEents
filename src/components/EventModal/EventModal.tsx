import React  from 'react'
import  './styles.scss'
import { LeftOutlined } from '@ant-design/icons'

type Props = {
	onClose: () => void
    isEdit: boolean
}

const EventModal = ({
	onClose,
    isEdit,
}: Props) => {

    const onCloseModal = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

	return (
    <div className="modal-background" onClick={onCloseModal}>
      <div className="modal-body">
        <LeftOutlined onClick={onCloseModal} />
        <h2>{isEdit ? 'Редактирование' : 'Создание'} события</h2>
        <p>Введите данные для редактирования события и сохраните изменения</p>
        <div className="custom-select">
          <select>
            <option value="0">Объект:</option>
            <option value="1">Audi</option>
            <option value="2">BMW</option>
          </select>
        </div>
        <div className="custom-select">
          <select>
            <option value="0">Тип:</option>
            <option value="1">Audi</option>
            <option value="2">BMW</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default EventModal
