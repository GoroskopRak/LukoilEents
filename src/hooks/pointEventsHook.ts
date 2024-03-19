import { useAppDispatch, useAppSelector } from "../app/hooks"
import { RootState } from "@/app/store"
import { ICreteDraftSupplyPointEvents, IDeleteDraftSupplyPointEvents, IFetchDraftSupplyPointEvents, IGetDraftSupplyPointPositions, IUpdateDraftSupplyPointEvents, createDraftSupplyPointEvent, deleteDraftSupplyPointEvent, fetchDraftSupplyPointEvent, fetchDraftSupplyPointEventObjects, fetchDraftSupplyPointEventTypes, getDraftSupplyPointEventPositions, selectAllPointEvents, selectAllPointEventsStatus, selectAvailableEventObjects, selectAvailableEventObjectsStatus, selectAvailableEventPosotions, selectAvailableEventPosotionsStatus, selectAvailableEventTypes, selectAvailableEventTypesStatus, updateDraftSupplyPointEvent } from "../services/pointEvents/pointEventsSlice"
import { LazyLoadableHook } from "../services/requestTypes"
import { useEffect } from "react"

interface IGetDraftSupplyPointEvents
	extends IFetchDraftSupplyPointEvents,
		LazyLoadableHook {}

export const useGetDraftSupplyPointEvents = ({
	onSuccess,
	onError,
	lazyLoad,
}: IGetDraftSupplyPointEvents) => {
	const dispatch = useAppDispatch()

	const status = useAppSelector((state: RootState) =>
    selectAllPointEventsStatus(state)
	)
	const allPointEvents = useAppSelector((state: RootState) =>
    selectAllPointEvents(state)
	)

	const fetch = () =>
		dispatch(fetchDraftSupplyPointEvent({ }))

	useEffect(() => {
		if (status === undefined && !lazyLoad) {
			fetch()
		}
	}, [status])

	return {
		status,
		refresh: fetch,
        allPointEvents,
	}
}

export const useGetDraftSupplyPointEventObjects = ({
	onSuccess,
	onError,
	lazyLoad,
}: IGetDraftSupplyPointEvents) => {
	const dispatch = useAppDispatch()

	const status = useAppSelector((state: RootState) =>
    selectAvailableEventObjectsStatus(state)
	)

	const availableEventObjects = useAppSelector((state: RootState) =>
    selectAvailableEventObjects(state)
	)

	const fetch = () =>
		dispatch(fetchDraftSupplyPointEventObjects({ }))

	useEffect(() => {
		if (status === undefined && !lazyLoad) {
			fetch()
		}
	}, [status])

	return {
		status,
		refresh: fetch,
        availableEventObjects,
	}
}

export const useGetDraftSupplyPointEventTypes = ({
	onSuccess,
	onError,
	lazyLoad,
}: IGetDraftSupplyPointEvents) => {
	const dispatch = useAppDispatch()

	const status = useAppSelector((state: RootState) =>
    selectAvailableEventTypesStatus(state)
	)
	const availableEventTypes = useAppSelector((state: RootState) =>
    selectAvailableEventTypes(state)
	)

	const fetch = () =>
		dispatch(fetchDraftSupplyPointEventTypes({ }))

	useEffect(() => {
		if (status === undefined && !lazyLoad) {
			fetch()
		}
	}, [status])

	return {
		status,
		refresh: fetch,
        availableEventTypes,
	}
}

export const useGetDraftSupplyPointEventPositions = ({
	onSuccess,
	onError,
	lazyLoad,
}: IGetDraftSupplyPointEvents) => {
	const dispatch = useAppDispatch()

	// const status = useAppSelector((state: RootState) =>
    // selectAvailableEventPosotionsStatus(state)
	// )
	const availableEventPositions = useAppSelector((state: RootState) =>
    selectAvailableEventPosotions(state)
	)

	const getDraftSupplyPointEventPositionsHandler = ({
		supplyPointId,
		onSuccess,
		onError,
	}: IGetDraftSupplyPointPositions) =>
	dispatch(getDraftSupplyPointEventPositions({supplyPointId}))

	return {
		// status,
		// refresh: fetch,
        availableEventPositions,
		getPositionsByPointId: getDraftSupplyPointEventPositionsHandler,
	}
}

export const useCreateDraftSupplyPointEvent = () => {
	const dispatch = useAppDispatch()

	const createDraftSupplyPointEventHandler = ({
		pointEvent,
		onSuccess,
		onError,
	}: ICreteDraftSupplyPointEvents) =>
		dispatch(createDraftSupplyPointEvent({pointEvent, onSuccess, onError }))


	return {
		createPointEvent: createDraftSupplyPointEventHandler,
	}
}

export const useUpdateDraftSupplyPointEvent = () => {
	const dispatch = useAppDispatch()

	const updateDraftSupplyPointEventHandler = ({
		pointEvent,
		onSuccess,
		onError,
	}: IUpdateDraftSupplyPointEvents) =>
		dispatch(updateDraftSupplyPointEvent({pointEvent, onSuccess, onError }))


	return {
		updatePointEvent: updateDraftSupplyPointEventHandler,
	}
}

export const useDeleteDraftSupplyPointEvent = () => {
	const dispatch = useAppDispatch()

	const deleteDraftSupplyPointEventHandler = ({
		id,
		onSuccess,
		onError,
	}: IDeleteDraftSupplyPointEvents) =>
		dispatch(deleteDraftSupplyPointEvent({id, onSuccess, onError }))


	return {
		deletePointEvent: deleteDraftSupplyPointEventHandler,
	}
}