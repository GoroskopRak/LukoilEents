import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import  './styles.scss'
import { useAppDispatch } from "../../app/hooks";
import { fetchLoginAppBasic } from "../../services/login/loginSlice";
import { IPointEvent, fetchDraftSupplyPointEvent } from "../../services/pointEvents/pointEventsSlice";
import { useDeleteDraftSupplyPointEvent, useGetDraftSupplyPointEvents } from "../../hooks/pointEventsHook";
import Header from "../../components/Header/header";
import "./styles.scss";
import Moment from "react-moment";
import "moment-timezone";
import EventModal from "../../components/EventModal/EventModal";

export const PointEventsPage = () => {
  const { allPointEvents, refresh } = useGetDraftSupplyPointEvents({});
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IPointEvent>(); //true-edit, false-create

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

  const onDeleteEvent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
    e.stopPropagation()
    deletePointEvent({id, onSuccess(data) {
      refresh()
    },})
  }

  return (
    <div className="event-page-container">
      <Header />
      <h2>События</h2>
      <div className="flex-between">
        <button>фильтр</button>
        <button onClick={onCreateEvent}>Создать событие</button>
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
                <td data-field="Value">График</td>
                <td data-field="Value">
                  <button onClick={(e) => onDeleteEvent(e, point?.Id as number)}>Удалить</button>
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
