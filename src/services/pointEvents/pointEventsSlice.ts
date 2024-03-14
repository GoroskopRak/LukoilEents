import { BaseInstanse, RestInstanse } from '../../app/axiosInstance'
import { RootState } from '@/app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RequestInterface, RequestState } from '../requestTypes'
import { getAuth } from '../../helpers/getAuth'

interface IModifier {
    BeginDate: string,
    EndDate: string,
    Value: number,
    Position: string
}

interface IPointEvent {
    SupplyPointName?: string
	TypeLocalName?: string
    Id?: number,
        TypeId: number,
        CreatorId?: number,
        SupplyPointId: number,
        BeginDate: string,
        IsAccepted?: boolean,
        IsAcceptedUserId?: number,
        AcceptDate?: {
            Seconds: number,
            Nanos: number
        },
        CreatedDate?: {
            Seconds: number,
            Nanos: number
        },
        ModifierData: IModifier[]
}

interface IInitialStateLogin {
    allPointEvents: IPointEvent[]
    allPointEventsStatus: RequestState

}

export interface IFetchDraftSupplyPointEvents extends RequestInterface<string> {
}


export const fetchDraftSupplyPointEvent = createAsyncThunk<
IPointEvent[],
	RequestInterface<IPointEvent[]>
>(
	'DraftSupplyPointEvent/get',
	async ({ onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.get(`/draft-supply-point-event`,{...getAuth()})
		const data: IPointEvent[] = await response.data

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


export const pointEventsSlice = createSlice({
    name: "pointEventsSlice",
    initialState: {
        allPointEvents: [],
        allPointEventsStatus: undefined,
    } as IInitialStateLogin,
    reducers: {},
    extraReducers(builder) {
      builder.addCase(fetchDraftSupplyPointEvent.fulfilled, (state, action) => {
        state.allPointEvents = action.payload
        state.allPointEventsStatus = 'fulfilled'
      });
    },
  });

export const selectAllPointEvents = (
	state: RootState,
) => state.PointEvents.allPointEvents

export const selectAllPointEventsStatus = (
	state: RootState,
) => state.PointEvents.allPointEventsStatus 