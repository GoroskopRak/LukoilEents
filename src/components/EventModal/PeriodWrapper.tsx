import React from "react";
import { IEventPosition, IModifier, IPeriodModifier } from "src/services/pointEvents/pointEventsSlice";

export const changePeriod = (
    setPeriods: (value: React.SetStateAction<IPeriodModifier[]>) => void,
    beginDate: string,
    currentPosition: IEventPosition[],
    e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    i: number,
    inputType: keyof IModifier | 'SingleValue' | 'BeginDateHour' | 'BeginDateMinute'| 'EndDateHour' | 'EndDateMinute',
    valueIndex?: number
  ) => {
    setPeriods((prev) => {
      const newPeriods = [...prev];
      const minutes = prev?.[i]?.[inputType.replace('Minute','').replace('Hour','') as keyof IModifier]?.slice(14,16) ? prev?.[i]?.[inputType.replace('Minute','').replace('Hour','') as keyof IModifier]?.slice(14,16) : '00'
      const hours = prev?.[i]?.[inputType.replace('Minute','').replace('Hour','') as keyof IModifier]?.slice(11,13) ? prev?.[i]?.[inputType.replace('Minute','').replace('Hour','') as keyof IModifier]?.slice(11,13) : '00'
      const value =
        inputType === "BeginDateHour" || inputType === "EndDateHour"
          ? beginDate?.split("T")?.[0]?.split(".")?.reverse()?.join("-") + "T" + e?.target?.value + ':' + minutes :
          inputType === "BeginDateMinute" || inputType === "EndDateMinute"
          ? beginDate?.split("T")?.[0]?.split(".")?.reverse()?.join("-") + "T" + hours +':' + e?.target?.value
          : inputType === "Value" && valueIndex === 0
          ? [-Math.abs(+e?.target?.value), prev?.[i]?.Value?.[1]]
          : inputType === "Value" && valueIndex === 1
          ? [prev?.[i]?.Value?.[0], +e?.target?.value]
          : e?.target?.value;
      newPeriods[i] = {
        ...newPeriods[i],
        [inputType.replace('Minute','').replace('Hour','')]: value,
        Position: [
          currentPosition?.[0]?.Position,
          currentPosition?.[1]?.Position,
        ],
      };
      return [...newPeriods];
    });
  };

export const PeriodWrapper = ({period, setPeriods, beginDate, currentPosition, i}:{period: IPeriodModifier, setPeriods: (value: React.SetStateAction<IPeriodModifier[]>) => void,
    beginDate: string,
    currentPosition: IEventPosition[], i: number}) => {

    const hours = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
    const minutes = ['00', '15','30','45']

    return (
        <div className="pair-wrapper">
                    <div className="pair">
                      с
                      <select className="custom-select datetime" value={period?.BeginDate?.split("T")?.[1]?.split(':')?.[0]} onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition, e, i, "BeginDateHour")}>
                      <option value={-1} key={-1}>
                        Часы
                      </option>
                        {hours?.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
                      </select>
                      <select className="custom-select datetime" value={period?.BeginDate?.split("T")?.[1]?.split(':')?.[1]} onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition, e, i, "BeginDateMinute")}>
                      <option value={-1} key={-1}>
                        Минуты
                      </option>
                        {minutes?.map((min) => <option key={min} value={min}>{min}</option>)}
                      </select>
                    </div>
                    <div className="red-line"></div>
                    <div className="pair">
                      до
                      <select className="custom-select datetime" value={period?.EndDate?.split("T")?.[1]?.split(':')?.[0]} onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition, e, i, "EndDateHour")}>
                      <option value={-1} key={-1}>
                        Часы
                      </option>
                        {hours?.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
                      </select>
                      <select className="custom-select datetime" value={period?.EndDate?.split("T")?.[1]?.split(':')?.[1]} onChange={(e) => changePeriod(setPeriods, beginDate, currentPosition, e, i, "EndDateMinute")}>
                      <option value={-1} key={-1}>
                        Минуты
                      </option>
                        {minutes?.map((min) => <option key={min} value={min}>{min}</option>)}
                      </select>
                    </div>
                  </div>
    )

}

