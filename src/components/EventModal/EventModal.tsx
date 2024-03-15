import React, { useEffect, useState } from "react";
import "./styles.scss";
import { LeftOutlined } from "@ant-design/icons";
import {
  useCreateDraftSupplyPointEvent,
  useGetDraftSupplyPointEventObjects,
  useGetDraftSupplyPointEventTypes,
  useGetDraftSupplyPointEvents,
} from "src/hooks/pointEventsHook";
import {
  IEventObject,
  IEventType,
  IModifier,
  IPointEvent,
} from "src/services/pointEvents/pointEventsSlice";
import moment from "moment";
import InputMask from 'react-input-mask';

type Props = {
  onClose: () => void;
  currentEvent: IPointEvent | undefined;
};

const EventModal = ({ onClose, currentEvent }: Props) => {
  const [currentObject, setCurrentObject] = useState<IEventObject>();
  const [currentType, setCurrentType] = useState<IEventType>();
  const [periods, setPeriods] = useState<IModifier[]>([{
    BeginDate: "",
    EndDate: "",
    Value: 0,
  },])
  const [beginDate, setBeginDate] = useState<string>(currentEvent ? moment(currentEvent?.BeginDate).format("DD MM YYYY") : moment.utc().add(5, 'hours').format("DD MM YYYY"))

  const { refresh } = useGetDraftSupplyPointEvents({});

  const { availableEventObjects } = useGetDraftSupplyPointEventObjects({});
  const { availableEventTypes } = useGetDraftSupplyPointEventTypes({});
  const { createPointEvent } = useCreateDraftSupplyPointEvent()

  const onCloseModal = (e: React.MouseEvent<HTMLElement>) => {
      onClose();
  };

  const addPeriod = () => {
    setPeriods((prev) => {
      return [
        ...prev,
        {
          BeginDate: "",
          EndDate: "",
          Value: 0,
          Position: currentObject?.Position
        },
      ];
    });
  };

  const changePeriod = (e: React.ChangeEvent<HTMLInputElement>, i: number, inputType:  keyof IModifier) =>  {
    setPeriods((prev) => {
      const newPeriods = prev
      const value = inputType === 'BeginDate' || inputType === 'EndDate' ? String(moment().toJSON())?.split('T')?.[0]+'T'+e?.target?.value : e?.target?.value
      newPeriods[i] = {...newPeriods[i], [inputType]: value, Position: currentObject?.Position,
}
      return [
        ...newPeriods
      ];
    });
  }

  const changeBeginDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBeginDate(e?.target?.value)
  }

  const saveEvent = () => {
    if (currentType?.Id && currentObject?.Id) {
      createPointEvent({pointEvent: {
        TypeId: currentType?.Id,
        SupplyPointId: String(currentObject?.Id),
        BeginDate: beginDate.split('.').reverse().join('-') + 'T00:00',
        ModifierData: periods
    }, onSuccess(data) {
      refresh()
    },})
    }
  }

  return (
    <div className="modal-background" >
      <div className="modal-body">
        <LeftOutlined onClick={onCloseModal} style={{fontSize: '30px'}}/>
        <h2>{!!currentEvent ? "Редактирование" : "Создание"} события</h2>
        <p>Введите данные для редактирования события и сохраните изменения</p>
        <InputMask mask="99.99.9999" name="BeginDate" type="text" placeholder="Дата" value={beginDate} onChange={changeBeginDate}/>
        <div>
          <select
            className="custom-select"
            onChange={(e) =>
              setCurrentObject(availableEventObjects[+e?.target?.value])
            }
          >
            <option value={-1}>Объект:</option>
            {availableEventObjects?.map((object, i) => (
              <option value={i}>{object?.SupplyPointName}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="custom-select"
            onChange={(e) =>
              setCurrentType(availableEventTypes[+e?.target?.value])
            }
          >
            <option value={-1}>Тип:</option>
            {availableEventTypes?.map((type, i) => (
              <option value={i}>{type?.LocalName}</option>
            ))}
          </select>
        </div>
        <input type="text" value={currentObject?.Position} disabled={true} placeholder="Позиция"/>
        <div>
          {periods?.map((period,i) => (
            <div className="period-container">
              Период {i+1}
            <InputMask  mask="99:99" value={period?.BeginDate?.split('T')?.[1]} placeholder="Время начала" onChange={(e) => changePeriod(e,i,'BeginDate')}/>
            <InputMask  mask="99:99" value={period?.EndDate?.split('T')?.[1]} placeholder="Время конца" onChange={(e) => changePeriod(e,i,'EndDate')}/>
            <input type="text" value={period?.Value} placeholder="Модификатор" onChange={(e) => changePeriod(e,i,'Value')}/>
            </div>
          ))}
        </div>
        <div>
          <button onClick={addPeriod}>+ Добавить период</button>
        </div>
        <button onClick={saveEvent}>Сохранить</button>
      </div>
    </div>
  );
};

export default EventModal;
