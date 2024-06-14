import { BaseInstanse, RestInstanse } from '../../app/axiosInstance'
import { RootState } from '@/app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RequestInterface, RequestState } from '../requestTypes'
import { getAuth } from '../../helpers/getAuth'

export interface IModifier {
    BeginDate: string,
    EndDate: string,
    Value: number,
    Position: string
}

export interface IPeriodModifier {
  BeginDate: string,
  EndDate: string,
  Value: number[],
  Position: string[]
}

export interface IPointEvent {
    SupplyPointName?: string
	TypeLocalName?: string
    Id?: number,
        TypeId: number,
        CreatorId?: number,
        SupplyPointId: string,
        BeginDate: string,
        IsAccepted?: boolean,
        IsAcceptedUserId?: number,
        AcceptDate?: string,
        CreatedDate?: string,
        ModifierData: IModifier[]
}

interface IInitialStateLogin {
    allPointEvents: IPointEvent[]
    allPointEventsStatus: RequestState

    availableEventObjects: IEventObject[]
    availableEventObjectsUniqNames: IEventObject[]
    availableEventObjectsStatus: RequestState
    availableEventTypes: IEventType[]
    availableEventTypesStatus: RequestState
    availableEventPositions: Record<string,IEventPosition[]>
    availableEventPositionsStatus: RequestState
}

export interface IFetchDraftSupplyPointEvents extends RequestInterface<IPointEvent[]> {
  searchPattern?: string
  beginDate?: string
  endDate?: string
  supplyPointId?: number
  eventSupplyPointMappingId?: number
}


export const fetchDraftSupplyPointEvent = createAsyncThunk<
IPointEvent[],
IFetchDraftSupplyPointEvents
>(
	'DraftSupplyPointEvent/get',
	async ({ searchPattern, beginDate, endDate, supplyPointId, eventSupplyPointMappingId ,onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.get(`/draft-supply-point-event`,{...getAuth(), params:{
      searchPattern,
      beginDate,
      endDate,
      supplyPointId,
      eventSupplyPointMappingId,
    }})
		const data: IPointEvent[] = await response.data

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)

export interface IEventObject {
    SupplyPointId: number
    Id: number,
    UserId: number,
    SupplyPointMappingId: number,
    Position: string,
    SupplyPointName: string
}

export const fetchDraftSupplyPointEventObjects = createAsyncThunk<
IEventObject[],
	RequestInterface<IEventObject[]>
>(
	'DraftSupplyPointEventObjects/get',
	async ({ onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.get<IEventObject[]>(`/user-supply-point-position-mapping`,{...getAuth()})
    const data =  await response.data
		const dataUniqNames: IEventObject[] =  [...new Map(response.data.map(item => [item.SupplyPointName, item])).values()];
    console.log(data, response.data)

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)

export interface IEventPosition {
  SupplyPointId: number
  Id: number;
  UserId: number;
  SupplyPointMappingId: number;
  Position: string;
  InstCapacity: number;
  SupplyPointName: string;
  MappedSupplyPointName: string;
}

export interface IGetDraftSupplyPointPositions extends RequestInterface<IEventPosition[]> {
  supplyPointId: number
}


export const getDraftSupplyPointEventPositions = createAsyncThunk<
IEventPosition[],
IGetDraftSupplyPointPositions
>(
  "DraftSupplyPointEventPositions/get",
  async ({ supplyPointId, onSuccess = () => null, onError = () => null }) => {
    const response = await RestInstanse.get(
      `/user-supply-point-position-mapping/by-user-and-sp?supplyPointId=${supplyPointId}`,
      { ...getAuth() }
    );
    const data: IEventPosition[] = await response.data;

    if (response.status === 200) {
      onSuccess(data);
    } else {
      onError();
    }

    return data;
  }
);

export interface IEventType{
    Id: number,
    LocalName: string,
    DraftSupplyPointEventOperationType: string
}

export const fetchDraftSupplyPointEventTypes = createAsyncThunk<
IEventType[],
	RequestInterface<IEventType[]>
>(
	'DraftSupplyPointEventTypes/get',
	async ({ onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.get(`/draft-supply-point-event-type`,{...getAuth()})
		const data: IEventType[] = await response.data

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)

export interface ICreteDraftSupplyPointEvents extends RequestInterface<IPointEvent> {
    pointEvent: IPointEvent
}


export const createDraftSupplyPointEvent = createAsyncThunk<
    IPointEvent,
    ICreteDraftSupplyPointEvents
>(
	'DraftSupplyPointEvent/create',
	async ({ pointEvent, onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.post(`/draft-supply-point-event`, pointEvent, {...getAuth()})
		const data: IPointEvent = await response.data

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)

export interface IUpdateDraftSupplyPointEvents extends RequestInterface<IPointEvent> {
  pointEvent: IPointEvent
}


export const updateDraftSupplyPointEvent = createAsyncThunk<
  IPointEvent,
  IUpdateDraftSupplyPointEvents
>(
'DraftSupplyPointEvent/update',
async ({ pointEvent, onSuccess = () => null, onError = () => null }) => {
  const response = await RestInstanse.put(`/draft-supply-point-event`, pointEvent, {...getAuth()})
  const data: IPointEvent = await response.data

  if (response.status === 200) {
    onSuccess(data)
  } else {
    onError()
  }

  return data
}
)

export interface IDeleteDraftSupplyPointEvent extends RequestInterface<IPointEvent> {
  id: number
}


export const deleteDraftSupplyPointEvent = createAsyncThunk<
  IPointEvent,
  IDeleteDraftSupplyPointEvent
>(
'DraftSupplyPointEvent/delete',
async ({ id, onSuccess = () => null, onError = () => null }) => {
  const response = await RestInstanse.delete(`/draft-supply-point-event?id=${id}`, {...getAuth()})
  const data: IPointEvent = await response.data

  if (response.status === 204) {
    onSuccess(data)
  } else {
    onError()
  }

  return data
}
)

export interface IAcceptDraftSupplyPointEvent extends RequestInterface<IPointEvent> {
  id: number
}


export const acceptDraftSupplyPointEvent = createAsyncThunk<
  IPointEvent,
  IAcceptDraftSupplyPointEvent
>(
'DraftSupplyPointEvent/accept',
async ({ id, onSuccess = () => null, onError = () => null }) => {
  const response = await RestInstanse.post(`/draft-supply-point-event/accept?id=${id}`,{} ,{...getAuth()})
  const data: IPointEvent = await response.data

  if (response.status === 204) {
    onSuccess(data)
  } else {
    onError()
  }

  return data
}
)


export const pointEventsSlice = createSlice({
    name: "pointEventsSlice",
    initialState: {
        allPointEvents: [],
        allPointEventsStatus: undefined,

        availableEventObjects: [],
        availableEventObjectsUniqNames: [],
        availableEventObjectsStatus: undefined,
        availableEventTypes: [],
        availableEventTypesStatus: undefined,
        availableEventPositions: {},
        availableEventPositionsStatus: undefined,
    } as IInitialStateLogin,
    reducers: {},
    extraReducers(builder) {
      builder.addCase(fetchDraftSupplyPointEvent.fulfilled, (state, action) => {
        state.allPointEvents = action.payload
        state.allPointEventsStatus = 'fulfilled'
      });
      builder.addCase(fetchDraftSupplyPointEventObjects.fulfilled, (state, action) => {
        state.availableEventObjects = action.payload
        state.availableEventObjectsUniqNames =  [...new Map(action.payload.map(item => [item.SupplyPointName, item])).values()];
        state.availableEventObjectsStatus = 'fulfilled'
      });
      builder.addCase(fetchDraftSupplyPointEventTypes.fulfilled, (state, action) => {
        state.availableEventTypes = action.payload
      });
      builder.addCase(getDraftSupplyPointEventPositions.fulfilled, (state, action) => {
        state.availableEventPositions[action.meta.arg.supplyPointId] = action.payload
      });
    },
  });

export const selectAllPointEvents = (
	state: RootState,
) => state.PointEvents.allPointEvents

export const selectAllPointEventsStatus = (
	state: RootState,
) => state.PointEvents.allPointEventsStatus 

export const selectAvailableEventObjects = (
	state: RootState,
) => state.PointEvents.availableEventObjects

export const selectAvailableEventObjectsUniqNames = (
	state: RootState,
) => state.PointEvents.availableEventObjectsUniqNames

export const selectAvailableEventObjectsStatus = (
	state: RootState,
) => state.PointEvents.availableEventObjectsStatus

export const selectAvailableEventTypes = (
	state: RootState,
) => state.PointEvents.availableEventTypes

export const selectAvailableEventTypesStatus = (
	state: RootState,
) => state.PointEvents.availableEventTypesStatus

export const selectAvailableEventPosotions = (
	state: RootState,
) => state.PointEvents.availableEventPositions

export const selectAvailableEventPosotionsStatus = (
	state: RootState,
) => state.PointEvents.availableEventPositionsStatus