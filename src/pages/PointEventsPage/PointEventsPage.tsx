import React, { useEffect, useMemo, useState } from "react";
import {
  IEventObject,
  IEventPosition,
  IModifier,
  IPointEvent,
} from "../../services/pointEvents/pointEventsSlice";
import {
  useAcceptDraftSupplyPointEvent,
  useDeleteDraftSupplyPointEvent,
  useGetDraftSupplyPointEventObjects,
  useGetDraftSupplyPointEventPositions,
  useGetDraftSupplyPointEventTypes,
  useGetDraftSupplyPointEvents,
} from "../../hooks/pointEventsHook";
import Header from "../../components/Header/header";
import "./styles.scss";
import Moment from "react-moment";
import "moment-timezone";
import EventModal from "../../components/EventModal/EventModal";
import { DeleteOutlined } from "@ant-design/icons";
import { AxisOptions, Chart } from "react-charts";
import { Positions, Series } from "./types";
import { useNavigate, useSearchParams } from "react-router-dom";
import simpleEncryptDecrypt from "./simpleEncryptDecrypt";
import { fillChartWithValues, fillChartWithZeros, primaryAxis, secondaryAxes } from "./helpers";
import { DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import dayjs from 'dayjs';
import {useDebounce} from "../../app/hooks";
import 'moment/locale/ru';

interface Props {
  role: "acceptor" | "lineman";
}

export const PointEventsPage = ({ role }: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IPointEvent>(); //true-edit, false-create
  const [searchPattern, setSearchPattern] = useState<string>("");
	const debouncedSearchPattern = useDebounce(searchPattern)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [beginDate, setBeginDate] = useState<dayjs.Dayjs>();
  const [endDate, setEndDate] = useState<dayjs.Dayjs>();
  const [currentObject, setCurrentObject] = useState<IEventObject>();
  const [currentPosition, setCurrentPosition] = useState<IEventPosition>();

  const { allPointEvents, refresh } = useGetDraftSupplyPointEvents({
    searchPattern: debouncedSearchPattern,
    beginDate: beginDate?.format('YYYY-MM-DDT00:00'),
    endDate: endDate?.format('YYYY-MM-DDT00:00'),
    supplyPointId: currentObject?.SupplyPointId,
    eventSupplyPointMappingId: currentPosition?.SupplyPointMappingId,

  });
  const { availableEventObjects } = useGetDraftSupplyPointEventObjects({});
  const { availableEventTypes } = useGetDraftSupplyPointEventTypes({});
  const { availableEventPositions, getPositionsByPointId } =
  useGetDraftSupplyPointEventPositions({});
  const { deletePointEvent } = useDeleteDraftSupplyPointEvent();
  const { acceptPointEvent } = useAcceptDraftSupplyPointEvent();

  const onCreateEvent = () => {
    setEventModalVisible(true);
    setCurrentEvent(undefined);
  };

  useEffect(() => {
    currentObject?.SupplyPointMappingId &&
      getPositionsByPointId({ supplyPointId: currentObject?.SupplyPointId });
  }, [currentObject]);

  useEffect(() => {
    if (role === "acceptor" && searchParams?.get("up")?.length) {
      const decryptedText = simpleEncryptDecrypt(
        searchParams?.get("up") as string,
        "секретныйКлючЛукойл"
      );
      decryptedText &&
        localStorage.setItem("username", decryptedText?.split("&")?.[0]);
      decryptedText &&
        localStorage.setItem("password", decryptedText?.split("&")?.[1]);
      navigate("/point-events-acceptor");
    }
  }, []);

  const onEditEvent = (
    e: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>,
    curr: IPointEvent
  ) => {
    e.stopPropagation();
    setEventModalVisible(true);
    setCurrentEvent(curr);
  };

  const onDeleteEvent = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    id: number
  ) => {
    e.stopPropagation();
    const answer = window.confirm("Удалить?");
    if (answer) {
      deletePointEvent({
        id,
        onSuccess(data) {
          refresh();
        },
      });
    }
  };

  const onAcceptEvent = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    e.stopPropagation();
    if (e?.target?.checked) {
      const answer = window.confirm("Одобрить событие?");
      if (answer) {
        acceptPointEvent({
          id,
          onSuccess(data) {
            refresh();
          },
          onError() {
            alert("Ошибка");
          },
        });
      }
    }
  };

  const chartsData = useMemo(() => {
    const chartsDataLocal: Record<string, Series[]> = {};
    allPointEvents?.forEach((point) => {
      const data: Series[] = [];
      const dataModifier: Positions[] = [];
      const chart1: Positions[] = [];
      const chart2: Positions[] = [];
      if (!availableEventTypes.find((types) => point?.TypeId === types.Id && types.DraftSupplyPointEventOperationType === 'TRANSITION')) {
        point?.ModifierData?.forEach((position, i) => {
          fillChartWithValues(dataModifier, position);
        });
        fillChartWithZeros(dataModifier);
        data?.push({
          label: point.SupplyPointName as string,
          data: dataModifier,
        });
      } else {
        const periodsUniq: Record<string, number> = {};
        point?.ModifierData?.forEach((position, i) => {
          const dataSet = position?.BeginDate + position?.EndDate;
          if (periodsUniq[dataSet] === undefined) {
            periodsUniq[dataSet] = position?.Value;
            fillChartWithValues(chart1, position);
          }
          if (periodsUniq[dataSet] !== position?.Value) {
            periodsUniq[dataSet] = position?.Value;
            fillChartWithValues(chart2, position);
          }
        });
        fillChartWithZeros(chart1);
        fillChartWithZeros(chart2);
        data?.push({ label: point.SupplyPointName as string, data: chart1 });
        data?.push({ label: point.SupplyPointName as string, data: chart2 });
      }
      chartsDataLocal[String(point?.Id)] = [...data];
    });
    return chartsDataLocal;
  }, [allPointEvents]);
  console.log(currentObject, availableEventPositions)
  return (
    <div className="event-page-container">
      <Header />
      <h1>События</h1>

      <div className="flex-between">
        <input
          className="search"
          placeholder="Контекстный поиск"
          onChange={(e) => setSearchPattern(e?.target?.value)}
        />
        {role === "lineman" && (
          <button className="create-evt-btn" onClick={onCreateEvent}>
            + Создать событие
          </button>
        )}
      </div>

      <button
        className="filter"
        onClick={() => setShowFiltersPanel((prev) => !prev)}
      >
        Фильтр
      </button>
      

      {showFiltersPanel && (
        <div className="date-picker-container">
          <DatePicker
							locale={locale}
              placeholder="Дата начала"
							value={beginDate ? dayjs(beginDate) : undefined} format={'DD.MM.YYYY'}
              onChange={(e) => setBeginDate(e)}
              onReset={(e) => setBeginDate(undefined)}
              className="date-picker"
						/>
            <DatePicker
							locale={locale}
              placeholder="Дата конца"
							value={endDate ? dayjs(endDate) : undefined} format={'DD.MM.YYYY'}
              onChange={(e) => setEndDate(e)}
              onReset={(e) => setEndDate(undefined)}
              className="date-picker"
						/>
            <select
              className="custom-select"
              onChange={(e) =>
                setCurrentObject(
                  availableEventObjects?.find(
                    (obj) => obj.Id === +e?.target?.value
                  )
                )
              }
              value={currentObject?.Id}
            >
              <option value={-1} key={-1}>
                Объект:
              </option>
              {availableEventObjects?.map((object, i) => (
                <option value={object?.Id} key={object?.Id}>
                  {object?.SupplyPointName}
                </option>
              ))}
            </select>
            <select
                    className="custom-select"
                    onChange={(e) => {
                      console.log(currentObject, e.target.value, availableEventPositions)
                      setCurrentPosition(availableEventPositions?.[currentObject?.SupplyPointId as number]?.find((pos) => pos?.Id === +e.target.value));
                    }}
                    value={currentPosition?.Id}
                  >
                    <option value={-1} key={-1}>
                      Позиция:
                    </option>
                    {availableEventPositions?.[currentObject?.SupplyPointId as number]?.map(
                      (pos, i) => (
                        <option value={pos?.Id} key={pos?.Id}>
                          {pos?.Position} ({pos?.MappedSupplyPointName})
                        </option>
                      )
                    )}
                  </select>
        </div>
      )}

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
              <tr data-tpl="row" className="table-row" key={point?.Id}>
                <td data-field="IsAccepted">
                  {role === "acceptor" && (
                    <input
                      className="toggle"
                      type="checkbox"
                      onChange={(e) => onAcceptEvent(e, point?.Id as number)}
                      checked={point?.IsAccepted ? point?.IsAccepted : false}
                    />
                  )}
                  {role === "lineman" && point?.IsAccepted && (
                    <div className="checkbox-container">
                      {" "}
                      <input
                        className="checkbox-status"
                        type="checkbox"
                        checked={point?.IsAccepted ? point?.IsAccepted : false}
                        disabled={true}
                      />
                    </div>
                  )}
                </td>
                <td
                  data-field="BeginDate"
                  onClick={(e) => onEditEvent(e, point)}
                >
                  <Moment format="D MMM YY" locale={'ru'}>{point?.BeginDate}</Moment>
                </td>
                <td
                  data-field="TypeLocalName"
                  onClick={(e) => onEditEvent(e, point)}
                >
                  {point?.TypeLocalName}
                </td>
                <td
                  data-field="SupplyPointName"
                  onClick={(e) => onEditEvent(e, point)}
                >
                  {point?.SupplyPointName}
                </td>
                <td
                  data-field="ModifierDataPositions"
                  onClick={(e) => onEditEvent(e, point)}
                >
                  {
                    new Set(
                      point?.ModifierData?.map(
                        (modifier) => modifier.Position + ", "
                      )
                    )
                  }
                </td>
                <td data-field="Value">
                  {chartsData?.[String(point?.Id)] && (
                    <div className="chart-container">
                      <Chart
                        options={{
                          data: chartsData?.[String(point?.Id)],
                          primaryAxis,
                          secondaryAxes,
                        }}
                        style={{ top: "0px" }}
                      />
                    </div>
                  )}
                </td>
                <td data-field="Value">
                  {role === "lineman" && (
                    <div className="table-actions">
                      <DeleteOutlined
                        onClick={(e) => onDeleteEvent(e, point?.Id as number)}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {eventModalVisible && (
        <EventModal
          currentEvent={currentEvent}
          onClose={() => setEventModalVisible(false)}
          searchPatternFilter={debouncedSearchPattern}
          beginDateFilter={beginDate?.format('YYYY-MM-DDT00:00')}
          endDateFilter={endDate?.format('YYYY-MM-DDT00:00')}
          supplyPointIdFilter={currentObject?.SupplyPointId}
          eventSupplyPointMappingIdFilter={currentPosition?.SupplyPointMappingId}
          role={role}
        ></EventModal>
      )}
    </div>
  );
};

export default PointEventsPage;
