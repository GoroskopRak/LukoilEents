import React, { useEffect, useState } from "react";
import { IPointEvent,  } from "../../services/pointEvents/pointEventsSlice";
import { useAcceptDraftSupplyPointEvent, useDeleteDraftSupplyPointEvent, useGetDraftSupplyPointEvents } from "../../hooks/pointEventsHook";
import Header from "../../components/Header/header";
import "./styles.scss";
import Moment from "react-moment";
import "moment-timezone";
import EventModal from "../../components/EventModal/EventModal";
import { DeleteOutlined } from "@ant-design/icons";
import { AxisOptions, Chart } from "react-charts";
import { Positions, Series } from "./types";
import InputMask from "react-input-mask";

export const PointEventsPage = () => {
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IPointEvent>(); //true-edit, false-create
  const [chartsData, setChartsData] = useState<Record<string,Series[]>>({})
  const [searchPattern, setSearchPattern] = useState<string>('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [beginDate, setBeginDate] = useState<string>()

  const { allPointEvents, refresh } = useGetDraftSupplyPointEvents({searchPattern, beginDate});
  const {deletePointEvent} = useDeleteDraftSupplyPointEvent()
  const {acceptPointEvent} = useAcceptDraftSupplyPointEvent()

  const onCreateEvent = () => {
    setEventModalVisible(true);
    setCurrentEvent(undefined);
  };

  const onEditEvent = (e: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>, curr: IPointEvent) => {
    e.stopPropagation()
    setEventModalVisible(true);
    setCurrentEvent(curr);
  };

  const onDeleteEvent = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: number) => {
    e.stopPropagation()
    const answer = window.confirm("Удалить?")
    if (answer) {
      deletePointEvent({id, onSuccess(data) {
        refresh()
      },})
    }
    
  }

  const onAcceptEvent = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.stopPropagation()
    if (e?.target?.checked) {
      const answer = window.confirm("Одобрить событие?")
    if (answer) {
      acceptPointEvent({id, onSuccess(data) {
        refresh()
      }, onError() {
        alert('Ошибка')
      },})
    }
    }
  }

useEffect(() => {
  allPointEvents?.forEach((point) => {
    const data: Series[] = []
    const dataModifier: Positions[] = []
    if (point?.TypeId !==3) {
      point?.ModifierData?.forEach((position, i) => {
        dataModifier?.push({date: +position?.BeginDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
        dataModifier?.push({date: +position?.EndDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
      })
      data?.push({label: point.SupplyPointName as string, data: dataModifier})
    } else {
      const periodsUniq: Record<string, number> = {}
      point?.ModifierData?.forEach((position, i) => {
        const dataSet = position?.BeginDate + position?.EndDate;
        if (periodsUniq[dataSet] === undefined) {
        dataModifier?.push({date: +position?.BeginDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
        periodsUniq[dataSet] = position?.Value
        }
        if (periodsUniq[dataSet] !== position?.Value) {
          dataModifier?.push({date: +position?.EndDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
          periodsUniq[dataSet] = position?.Value
          }
      })
      data?.push({label: point.SupplyPointName as string, data: dataModifier})
    }
    setChartsData((prev) => {return {...prev, [String(point?.Id)]: data}})
  })
}, [allPointEvents])
  const primaryAxis = React.useMemo(
    (): AxisOptions<Positions> => ({
      getValue: datum => datum.date,
      show: false,
        showDatumElements: false,
        
    }),
    []
  )
  const secondaryAxes = React.useMemo(
    (): AxisOptions<Positions>[] => [
      {
        getValue: datum => datum.value,
        show: false,
        showDatumElements: false,
      },
    ],
    []
  )

  return (
    <div className="event-page-container">
      <Header />
      <h1>События</h1>
      
      <div className="flex-between">
        <input className="search" placeholder="Поиск" onChange={(e) => setSearchPattern(e?.target?.value)}/>
        <button className="create-evt-btn" onClick={onCreateEvent}>+ Создать событие</button>
      </div>

      <button className="filter" onClick={() => setShowFiltersPanel((prev) => !prev)}>Фильтр</button>

      {showFiltersPanel && 
      <div>
        <InputMask
            mask="99.99.9999"
            name="BeginDate"
            type="text"
            placeholder="Дата начала"
            value={beginDate}
            onChange={(e) => setBeginDate(e?.target?.value)}
          />
        </div>}

      <table className="point-events-table">
        <thead data-tpl="head">
          <tr>
            <td data-field="IsAccepted">Статус</td>
            <td data-field="BeginDate">Дата начала</td>

            <td data-field="TypeLocalName">Тип</td>
            <td data-field="SupplyPointName">Объект</td>
            <td data-field="ModifierDataPositions">Точка</td>

            <td data-field="Value">График</td>
            <td data-field="Value">Действия</td>
          </tr>
        </thead>
        <tbody>
          {allPointEvents &&
            allPointEvents?.map((point) => (
              <tr data-tpl="row" className="table-row"  key={point?.Id}>
                <td data-field="IsAccepted">
                  <input className="toggle" type="checkbox" onChange={(e) => onAcceptEvent(e, point?.Id as number)} checked={point?.IsAccepted ? point?.IsAccepted : false}/>
                </td>
                <td data-field="BeginDate" onClick={(e) => onEditEvent(e, point)}>
                  <Moment format="D MMM YY">{point?.BeginDate}</Moment>
                </td>
                <td data-field="TypeLocalName" onClick={(e) => onEditEvent(e, point)}>{point?.TypeLocalName}</td>
                <td data-field="SupplyPointName" onClick={(e) => onEditEvent(e, point)}>{point?.SupplyPointName}</td>
                <td data-field="ModifierDataPositions" onClick={(e) => onEditEvent(e, point)}>
                  {new Set(point?.ModifierData?.map(
                    (modifier) => modifier.Position + ", "
                  ))}
                </td>
                <td data-field="Value">
                  {chartsData?.[String(point?.Id)] && 
                  <div className="chart-container">
                <Chart
                  options={{
                    data: chartsData?.[String(point?.Id)],
                    primaryAxis,
                    secondaryAxes,
                  }}
                  style={{top: '0px', fill: 'red'}}
                /></div>}</td>
                <td data-field="Value">
                  <div className="table-actions"><DeleteOutlined onClick={(e) => onDeleteEvent(e, point?.Id as number)}/></div>
                
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {eventModalVisible && (
        <EventModal
          currentEvent={currentEvent}
          onClose={() => setEventModalVisible(false)}
          searchPatternFilter={searchPattern}
          beginDateFilter={beginDate}
        ></EventModal>
      )}
    </div>
  );
};

export default PointEventsPage;
