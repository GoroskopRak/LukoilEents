import React, { FormEvent, useEffect, useRef, useState } from "react";
import { IPointEvent, fetchDraftSupplyPointEvent } from "../../services/pointEvents/pointEventsSlice";
import { useDeleteDraftSupplyPointEvent, useGetDraftSupplyPointEvents } from "../../hooks/pointEventsHook";
import Header from "../../components/Header/header";
import "./styles.scss";
import Moment from "react-moment";
import "moment-timezone";
import EventModal from "../../components/EventModal/EventModal";
import { DeleteOutlined } from "@ant-design/icons";
import { AxisOptions, Chart } from "react-charts";
import { Positions, Series } from "./types";

export const PointEventsPage = () => {
  const { allPointEvents, refresh } = useGetDraftSupplyPointEvents({});
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IPointEvent>(); //true-edit, false-create
  const [chartsData, setChartsData] = useState<Record<string,Series[]>>({})

  const {deletePointEvent} = useDeleteDraftSupplyPointEvent()

  const onCreateEvent = () => {
    setEventModalVisible(true);
    setCurrentEvent(undefined);
  };

  const onEditEvent = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, curr: IPointEvent) => {
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

useEffect(() => {
  allPointEvents?.forEach((point) => {
    const data: Series[] = []
    const dataModifier: Positions[] = []
    point?.ModifierData?.forEach((position, i) => {
      dataModifier?.push({date: +position?.BeginDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
      dataModifier?.push({date: +position?.EndDate?.split('T')?.[1]?.split(':')?.[0], value: position?.Value, })
    })
    data?.push({label: point.SupplyPointName as string, data: dataModifier})
    
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
        <button>фильтр</button>
        <button onClick={onCreateEvent}>+ Создать событие</button>
      </div>

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
              <tr data-tpl="row" className="table-row" onClick={(e) => onEditEvent(e, point)} key={point?.Id}>
                <td data-field="IsAccepted">
                  <input type="checkbox" checked={point?.IsAccepted} disabled/>
                </td>
                <td data-field="BeginDate">
                  <Moment format="D MMM YY">{point?.BeginDate}</Moment>
                </td>
                <td data-field="TypeLocalName">{point?.TypeLocalName}</td>
                <td data-field="SupplyPointName">{point?.SupplyPointName}</td>
                <td data-field="ModifierDataPositions">
                  {point?.ModifierData?.map(
                    (modifier) => modifier.Position + ", "
                  )}
                </td>
                <td data-field="Value">{chartsData?.[String(point?.Id)] && <Chart
                
          options={{
            data: chartsData?.[String(point?.Id)],
            primaryAxis,
            secondaryAxes,
          }}
          style={{top: '0px', fill: 'red'}}
        />}</td>
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
        ></EventModal>
      )}
    </div>
  );
};

export default PointEventsPage;
