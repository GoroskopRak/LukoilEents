import React, { useEffect, useState } from "react";
import "./styles.scss";
import { LeftOutlined } from "@ant-design/icons";
import {
  useCreateDraftSupplyPointEvent,
  useGetDraftSupplyPointEventObjects,
  useGetDraftSupplyPointEventPositions,
  useGetDraftSupplyPointEventTypes,
  useGetDraftSupplyPointEvents,
  useUpdateDraftSupplyPointEvent,
} from "src/hooks/pointEventsHook";
import {
  IEventObject,
  IEventPosition,
  IEventType,
  IModifier,
  IPeriodModifier,
  IPointEvent,
} from "src/services/pointEvents/pointEventsSlice";
import moment from "moment";
import { DatePicker, message } from 'antd';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import { PeriodTransitionWrapper, PeriodWrapper, changePeriod } from "./PeriodWrapper";

type Props = {
  onClose: () => void;
  currentEvent: IPointEvent | undefined;
  searchPatternFilter: string
  beginDateFilter?: string
  endDateFilter?: string
  supplyPointIdFilter?: number
  eventSupplyPointMappingIdFilter?: number
  role: 'lineman' | 'acceptor'
};

const EventModal = ({ onClose, currentEvent, searchPatternFilter, beginDateFilter, endDateFilter, supplyPointIdFilter, eventSupplyPointMappingIdFilter, role }: Props) => {
  const [currentObject, setCurrentObject] = useState<IEventObject>();
  const [currentType, setCurrentType] = useState<IEventType>();
  const [currentPosition, setCurrentPosition] = useState<IEventPosition[]>([]); //две позиции для перехода, type=3
  const [periods, setPeriods] = useState<IPeriodModifier[]>([
    {
      BeginDate: "",
      EndDate: "",
      Value: [
        currentPosition?.[0]?.InstCapacity,
        currentPosition?.[1]?.InstCapacity,
      ],
      Position: [
        currentPosition?.[0]?.Position,
        currentPosition?.[1]?.Position,
      ],
    },
  ]);
  const [beginDate, setBeginDate] = useState<string>(
    currentEvent
      ? moment(currentEvent?.BeginDate).format("DD.MM.YYYY")
      : moment.utc().add(5, "hours").format("DD.MM.YYYY")
  );
  const { refresh } = useGetDraftSupplyPointEvents({searchPattern: searchPatternFilter, beginDate: beginDateFilter, endDate: endDateFilter, supplyPointId: supplyPointIdFilter, eventSupplyPointMappingId: eventSupplyPointMappingIdFilter});

  const { availableEventObjects } = useGetDraftSupplyPointEventObjects({});
  const { availableEventTypes } = useGetDraftSupplyPointEventTypes({});
  const { availableEventPositions, getPositionsByPointId } =
    useGetDraftSupplyPointEventPositions({});
  const { createPointEvent } = useCreateDraftSupplyPointEvent();
  const { updatePointEvent } = useUpdateDraftSupplyPointEvent();

  const onCloseModal = (e: React.MouseEvent<HTMLElement>) => {
    onClose();
  };

  useEffect(() => {
    currentObject?.SupplyPointMappingId &&
      getPositionsByPointId({ supplyPointId: currentObject?.SupplyPointId });
  }, [currentObject]);

  useEffect(() => {
    !currentEvent &&
      setPeriods(() => {
        return [
          {
            BeginDate: "",
            EndDate: "",
            Value: [
              currentPosition?.[0]?.InstCapacity,
              currentPosition?.[1]?.InstCapacity,
            ],
            Position: [
              currentPosition?.[0]?.Position,
              currentPosition?.[1]?.Position,
            ],
          },
        ];
      });
  }, [currentPosition, currentEvent]);

  useEffect(() => {
    if (!!currentEvent) {
      const currentObjectLocal = availableEventObjects?.find(
        (obj) => obj.SupplyPointId === +currentEvent?.SupplyPointId
      )
      currentObjectLocal&&setCurrentObject(currentObjectLocal);
      setCurrentType(
        availableEventTypes?.find((type) => type.Id === +currentEvent?.TypeId)
      );

      const periodsUniq: Record<string, IPeriodModifier> = {};
      const currentPositions: IEventPosition[] = []
      
      currentEvent?.ModifierData?.forEach((modi) => {
        const dataSet = modi?.BeginDate + modi?.EndDate;
        if (periodsUniq[dataSet] === undefined) {
          periodsUniq[dataSet] = {
            BeginDate: modi?.BeginDate,
            EndDate: modi?.EndDate,
            Value: [modi?.Value],
            Position: [modi?.Position],
          };
        } else {
          periodsUniq[dataSet] = {
            ...periodsUniq[dataSet],
            Value: [...periodsUniq[dataSet]?.Value, modi?.Value],
            Position: [...periodsUniq[dataSet]?.Position, modi?.Position],
          };
        }
      });
      setPeriods(Object.values(periodsUniq));
      for (const key in periodsUniq) {
        periodsUniq?.[key]?.Position?.forEach((posName) => {
          if (currentObjectLocal?.SupplyPointId){
          const selectedPos = availableEventPositions?.[currentObjectLocal?.SupplyPointId]?.find((pos) => pos?.Position ===posName)
          selectedPos && currentPositions?.push(selectedPos)
          }
        })
      }
      setCurrentPosition(currentPositions)
      
    }
  }, [currentEvent, availableEventObjects, availableEventTypes, availableEventPositions]);

  const addPeriod = () => {
    setPeriods((prev) => {
      return [
        ...prev,
        {
          BeginDate: "",
          EndDate: "",
          Value: [
            currentPosition?.[0]?.InstCapacity,
            currentPosition?.[1]?.InstCapacity,
          ],
          Position: [
            currentPosition?.[0]?.Position,
            currentPosition?.[1]?.Position,
          ],
        },
      ];
    });
  };

  const changeBeginDate = (e: dayjs.Dayjs) => {
    const newBeginDate = e.format('DD.MM.YYYY')
    setBeginDate(newBeginDate);
    newBeginDate && setPeriods((prev) => {
      const newPeriods = [...prev];
      newPeriods?.map((period) => {
        period.BeginDate=newBeginDate?.split("T")?.[0]?.split(".")?.reverse()?.join("-") + "T" + period.BeginDate?.split("T")?.[1]
        period.EndDate=newBeginDate?.split("T")?.[0]?.split(".")?.reverse()?.join("-") + "T" + period.EndDate?.split("T")?.[1]
      })
      return [...newPeriods];
    });
  };

  const saveOrUpdateEvent = () => {
    if (periods?.[0].BeginDate !=='' && periods?.[0].EndDate !=='' && !!currentPosition) {
    if (!!currentEvent) {
      if (currentType?.Id && currentObject?.SupplyPointId) {
        if (currentType?.DraftSupplyPointEventOperationType !== 'TRANSITION') {
          const modifier: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: (el?.Value?.[0] * (currentType.DraftSupplyPointEventOperationType == 'DOWN' ? -1 : 1)),
              Position: el?.Position?.[0],
            };
          });
          updatePointEvent({
            pointEvent: {
              ...(currentEvent as IPointEvent),
              TypeId: currentType?.Id,
              SupplyPointId: String(currentObject?.SupplyPointId),
              BeginDate: beginDate.split(".").reverse().join("-") + "T00:00",
              ModifierData: modifier,
            },
            onSuccess(data) {
              refresh();
              
              onClose()
              // alert('Обновлено')
            },
          });
        } else {
          const modifierFrom: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: -Math.abs(el?.Value?.[0]),
              Position: el?.Position?.[0],
            };
          });
          const modifierTo: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: el?.Value?.[1],
              Position: el?.Position?.[1],
            };
          });
          updatePointEvent({
            pointEvent: {
              ...(currentEvent as IPointEvent),
              TypeId: currentType?.Id,
              SupplyPointId: String(currentObject?.SupplyPointId),
              BeginDate: beginDate.split(".").reverse().join("-") + "T00:00",
              ModifierData: [...modifierFrom, ...modifierTo],
            },
            onSuccess(data) {
              refresh();
              
              onClose()
              // alert('Обновлено')
            },
          });
        }
      }
    } else {
      //save
      if (currentType?.Id && currentObject?.SupplyPointId) {
        if (currentType?.DraftSupplyPointEventOperationType !== 'TRANSITION') {
          const modifier: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: el?.Value?.[0],
              Position: el?.Position?.[0],
            };
          });
          createPointEvent({
            pointEvent: {
              TypeId: currentType?.Id,
              SupplyPointId: String(currentObject?.SupplyPointId),
              BeginDate: beginDate.split(".").reverse().join("-") + "T00:00",
              ModifierData: modifier,
            },
            onSuccess(data) {
              refresh();
              onClose()
              // alert('Сохранено')
            },
          });
        } else {
          const modifierFrom: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: -Math.abs(el?.Value?.[0]),
              Position: el?.Position?.[0],
            };
          });
          const modifierTo: IModifier[] = periods?.map((el) => {
            return {
              ...el,
              Value: el?.Value?.[1],
              Position: el?.Position?.[1],
            };
          });
          createPointEvent({
            pointEvent: {
              TypeId: currentType?.Id,
              SupplyPointId: String(currentObject?.SupplyPointId),
              BeginDate: beginDate.split(".").reverse().join("-") + "T00:00",
              ModifierData: [...modifierFrom, ...modifierTo],
            },
            onSuccess(data) {
              refresh();
              
              onClose()
              // alert('Сохранено')
            },
          });
        }
      }
    }
  } else {
    message.error('Не все поля заполнены', 1)
  }
  };

  return (
    <div className="modal-background">
      <div className="modal-body">
        <div className="scroll-container">
          <LeftOutlined
            onClick={onCloseModal}
            style={{ fontSize: "30px", width: "30px" }}
          />
          <h2>{role === 'acceptor' ? 'Просмотр' : !!currentEvent ? "Редактирование" : "Создание"} события</h2>
          {role === 'lineman' && <p>
            Введите данные для {!!currentEvent ? "редактирования" : "создания"}{" "}
            события и сохраните изменения
          </p>}
          <DatePicker
							locale={locale}
							value={dayjs(beginDate, 'DD.MM.YYYY')} format={'DD.MM.YYYY'}
              onChange={changeBeginDate}
              className="date-picker"
						/>
          <div>
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
          </div>
          <div>
            <select
              className="custom-select"
              onChange={(e) =>
                setCurrentType(
                  availableEventTypes?.find(
                    (type) => type.Id === +e?.target?.value
                  )
                )
              }
              value={currentType?.Id}
            >
              <option value={-1} key={-1}>
                Тип:
              </option>
              {availableEventTypes?.map((type, i) => (
                <option value={type?.Id} key={type?.Id}>
                  {type?.LocalName}
                </option>
              ))}
            </select>
          </div>
          {currentType?.DraftSupplyPointEventOperationType !== 'TRANSITION'? (
            <div>
              <select
                className="custom-select"
                onChange={(e) => {
                  currentObject?.SupplyPointId &&
                    setCurrentPosition([
                      availableEventPositions?.[
                        currentObject?.SupplyPointId
                      ]?.find(
                        (pos) => pos.Id === +e?.target?.value
                      ) as IEventPosition,
                    ]);
                }}
                value={currentPosition?.[0]?.Id}
              >
                <option value={-1} key={-1}>
                  Позиция:
                </option>
                {currentObject?.SupplyPointId &&
                  availableEventPositions?.[
                    currentObject?.SupplyPointId
                  ]?.map((pos, i) => (
                    <option value={pos?.Id} key={pos?.Id}>
                      {pos?.Position} ({pos?.MappedSupplyPointName})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <>
              <div className="pair-wrapper">
                <div className="pair">
                  с
                  <select
                    className="custom-select"
                    onChange={(e) => {
                      setCurrentPosition((prev) => {
                        const newPosition: IEventPosition[] = [...prev];
                        newPosition[0] = availableEventPositions?.[
                          currentObject?.SupplyPointId as number
                        ]?.find(
                          (pos) => pos.Id === +e?.target?.value
                        ) as IEventPosition;
                        return newPosition;
                      });
                    }}
                    value={currentPosition?.[0]?.Id}
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
                <div className="red-line"></div>
                <div className="pair">
                  на
                  <select
                    className="custom-select"
                    onChange={(e) => {
                      setCurrentPosition((prev) => {
                        const newPosition: IEventPosition[] = [...prev];
                        newPosition[1] = availableEventPositions?.[
                          currentObject?.SupplyPointId as number
                        ]?.find(
                          (pos) => pos.Id === +e?.target?.value
                        ) as IEventPosition;
                        return newPosition;
                      });
                    }}
                    value={currentPosition?.[1]?.Id}
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
              </div>
            </>
          )}
          {currentType?.DraftSupplyPointEventOperationType !== 'TRANSITION' ? (
            <div>
              {periods?.map((period, i) => (
                <div className="period-container" key={'period-'+i}>
                  <div className="period"> Период {i + 1}</div>
                  <PeriodWrapper period={period} setPeriods={setPeriods} beginDate={beginDate} currentPosition={currentPosition} i={i}/>
                  <div className="modificator-container">
                  {currentType?.DraftSupplyPointEventOperationType === 'DOWN' && <span>-</span>}
                  <input
                    type="text"
                    value={period?.Value?.[0]}
                    placeholder="Модификатор"
                    onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition,e, i, "SingleValue", 0)}
                  /></div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {periods?.map((period, i) => (
                <div className="period-container" key={'period'+i}>
                  <div className="period"> Период {i + 1}</div>
                  <PeriodTransitionWrapper period={period} setPeriods={setPeriods} beginDate={beginDate} currentPosition={currentPosition} i={i}/>
                  <div className="pair-wrapper">
                    <div className="pair">
                      -
                      <input
                        type="text"
                        value={Math.abs(period?.Value?.[0])}
                        placeholder="Модификатор"
                        onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition,e, i, "Value", 0)}
                      />{" "}
                    </div>
                    <div className="red-line"></div>
                    <div className="pair">
                      +
                      <input
                        type="text"
                        value={period?.Value?.[1]}
                        placeholder="Модификатор"
                        onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition,e, i, "Value", 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
          {role === 'lineman' && <button onClick={addPeriod}>+ Добавить период</button>}
          </div>
          {role === 'lineman' && <button onClick={saveOrUpdateEvent}>Сохранить</button>}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
