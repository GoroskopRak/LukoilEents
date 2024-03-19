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
  IPointEvent,
} from "src/services/pointEvents/pointEventsSlice";
import moment from "moment";
import InputMask from "react-input-mask";

type Props = {
  onClose: () => void;
  currentEvent: IPointEvent | undefined;
};

const EventModal = ({ onClose, currentEvent }: Props) => {
  const [currentObject, setCurrentObject] = useState<IEventObject>();
  const [currentType, setCurrentType] = useState<IEventType>();
  const [currentPosition, setCurrentPosition] = useState<IEventPosition[]>([]);//две позиции для перехода, type=3
  const [periods, setPeriods] = useState<IModifier[]>([
    {
      BeginDate: "",
      EndDate: "",
      Value: 0,
    },
  ]);
  const [beginDate, setBeginDate] = useState<string>(
    currentEvent
      ? moment(currentEvent?.BeginDate).format("DD.MM.YYYY")
      : moment.utc().add(5, "hours").format("DD.MM.YYYY")
  );
  const SUPPLY_POINT_ID = currentObject?.SupplyPointMappingId as number

  const { refresh } = useGetDraftSupplyPointEvents({});

  const { availableEventObjects } = useGetDraftSupplyPointEventObjects({});
  const { availableEventTypes } = useGetDraftSupplyPointEventTypes({});
  const { availableEventPositions, getPositionsByPointId} =
    useGetDraftSupplyPointEventPositions({});
  const { createPointEvent } = useCreateDraftSupplyPointEvent();
  const { updatePointEvent } = useUpdateDraftSupplyPointEvent();

  const onCloseModal = (e: React.MouseEvent<HTMLElement>) => {
    onClose();
  };

  useEffect(() => {
    SUPPLY_POINT_ID  && getPositionsByPointId({supplyPointId: SUPPLY_POINT_ID})
  }, [currentObject])

  useEffect(() => {
    if (!!currentEvent) {
      setCurrentObject(
        availableEventObjects?.find(
          (obj) => obj.Id === +currentEvent?.SupplyPointId
        )
      );
      setCurrentType(
        availableEventTypes?.find((type) => type.Id === +currentEvent?.TypeId)
      );
      setPeriods(currentEvent?.ModifierData);
      SUPPLY_POINT_ID && setCurrentPosition([availableEventPositions?.[SUPPLY_POINT_ID]?.find(
        (pos) => pos.Id === +currentEvent?.SupplyPointId
      ) as IEventPosition])
    }
  }, [currentEvent, availableEventObjects, availableEventTypes]);

  useEffect(() => {
    SUPPLY_POINT_ID && getPositionsByPointId({supplyPointId: SUPPLY_POINT_ID});
  }, [SUPPLY_POINT_ID]);

  const addPeriod = () => {
    setPeriods((prev) => {
      return [
        ...prev,
        {
          BeginDate: "",
          EndDate: "",
          Value: 0,
          Position: currentPosition?.[0]?.Position,
        },
      ];
    });
  };

  const changePeriod = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
    inputType: keyof IModifier
  ) => {
    setPeriods((prev) => {
      const newPeriods = [...prev];
      const value =
        inputType === "BeginDate" || inputType === "EndDate"
          ? String(moment().toJSON())?.split("T")?.[0] + "T" + e?.target?.value
          : inputType === "Value"
          ? +e?.target?.value
          : e?.target?.value;
      newPeriods[i] = {
        ...newPeriods[i],
        [inputType]: value,
        Position: currentPosition?.[0]?.Position,
      };
      return [...newPeriods];
    });
  };

  const changeBeginDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBeginDate(e?.target?.value);
  };

  const saveOrUpdateEvent = () => {
    if (!!currentEvent) {
      //upd
      updatePointEvent({
        pointEvent: { ...(currentEvent as IPointEvent) },
        onSuccess(data) {
          refresh();
        },
      });
    } else {
      //save
      if (currentType?.Id && currentObject?.Id) {
        createPointEvent({
          pointEvent: {
            TypeId: currentType?.Id,
            SupplyPointId: String(currentObject?.Id),
            BeginDate: beginDate.split(".").reverse().join("-") + "T00:00",
            ModifierData: periods,
          },
          onSuccess(data) {
            refresh();
          },
        });
      }
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
          <h2>{!!currentEvent ? "Редактирование" : "Создание"} события</h2>
          <p>
            Введите данные для {!!currentEvent ? "редактирования" : "создания"}{" "}
            события и сохраните изменения
          </p>
          <InputMask
            mask="99.99.9999"
            name="BeginDate"
            type="text"
            placeholder="Дата"
            value={beginDate}
            onChange={changeBeginDate}
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
          {currentType?.Id !== 3 ? ( 
            <div>
              <select
                className="custom-select"
                onChange={(e) =>{
                  currentObject?.SupplyPointMappingId && setCurrentPosition([availableEventPositions?.[currentObject?.SupplyPointMappingId]?.find(
                    (pos) => pos.Id === +e?.target?.value
                  ) as IEventPosition])}
                }
                value={currentPosition?.[0]?.Id}
              >
                <option value={-1} key={-1}>
                  Позиция:
                </option>
                {currentObject?.SupplyPointMappingId &&availableEventPositions?.[currentObject?.SupplyPointMappingId]?.map((pos, i) => (
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
                    onChange={(e) =>{
                      setCurrentPosition((prev) => {
                        const newPosition: IEventPosition[] = [...prev]
                      newPosition[0] = availableEventPositions?.[SUPPLY_POINT_ID]?.find(
                        (pos) => pos.Id === +e?.target?.value
                      ) as IEventPosition
                        return newPosition
                      }
                      )}
                    }
                    value={currentPosition?.[1]?.Id}
                  >
                    <option value={-1} key={-1}>
                      Позиция:
                    </option>
                    {availableEventPositions?.[SUPPLY_POINT_ID]?.map((pos, i) => (
                      <option value={pos?.Id} key={pos?.Id}>
                        {pos?.Position} ({pos?.MappedSupplyPointName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="red-line"></div>
                <div className="pair">
                  на
                  <select
                    className="custom-select"
                    onChange={(e) =>{
                      setCurrentPosition((prev) => {
                        const newPosition: IEventPosition[] = [...prev]
                      newPosition[1] = availableEventPositions?.[SUPPLY_POINT_ID]?.find(
                        (pos) => pos.Id === +e?.target?.value
                      ) as IEventPosition
                        return newPosition
                      }
                      )}
                    }
                    value={currentPosition?.[1]?.Id}
                  >
                    <option value={-1} key={-1}>
                      Позиция:
                    </option>
                    {availableEventPositions?.[SUPPLY_POINT_ID]?.map((pos, i) => (
                      <option value={pos?.Id} key={pos?.Id}>
                        {pos?.Position} ({pos?.MappedSupplyPointName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {currentType?.Id !== 3 ? (
            <div>
              {periods?.map((period, i) => (
                <div className="period-container">
                  <div className="period"> Период {i + 1}</div>
                  <div className="pair-wrapper">
                    <div className="pair">
                      с
                      <InputMask
                        mask="99:99"
                        value={period?.BeginDate?.split("T")?.[1]}
                        placeholder="Время начала"
                        onChange={(e) => changePeriod(e, i, "BeginDate")}
                      />
                    </div>
                    <div className="red-line"></div>
                    <div className="pair">
                      до
                      <InputMask
                        mask="99:99"
                        value={period?.EndDate?.split("T")?.[1]}
                        placeholder="Время конца"
                        onChange={(e) => changePeriod(e, i, "EndDate")}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={period?.Value}
                    placeholder="Модификатор"
                    onChange={(e) => changePeriod(e, i, "Value")}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {periods?.map((period, i) => (
                <div className="period-container">
                  <div className="period"> Период {i + 1}</div>
                  <div className="pair-wrapper">
                    <div className="pair">
                      с
                      <InputMask
                        mask="99:99"
                        value={period?.BeginDate?.split("T")?.[1]}
                        placeholder="Время начала"
                        onChange={(e) => changePeriod(e, i, "BeginDate")}
                      />
                    </div>
                    <div className="red-line"></div>
                    <div className="pair">
                      до
                      <InputMask
                        mask="99:99"
                        value={period?.EndDate?.split("T")?.[1]}
                        placeholder="Время конца"
                        onChange={(e) => changePeriod(e, i, "EndDate")}
                      />
                    </div>
                  </div>
                  <div className="pair-wrapper">
                    <div className="pair">
                      с
                      <input
                        type="text"
                        value={period?.Value}
                        placeholder="Модификатор"
                        onChange={(e) => changePeriod(e, i, "Value")}
                      />{" "}
                    </div>
                    <div className="red-line"></div>
                    <div className="pair">
                      до
                      <input
                        type="text"
                        value={period?.Value}
                        placeholder="Модификатор"
                        onChange={(e) => changePeriod(e, i, "Value")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            <div>
              <button onClick={addPeriod}>+ Добавить период</button>
            </div>
          <button onClick={saveOrUpdateEvent}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
