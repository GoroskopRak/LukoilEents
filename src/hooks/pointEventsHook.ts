import { useAppDispatch, useAppSelector } from "../app/hooks"
import { RootState } from "@/app/store"
import { IFetchDraftSupplyPointEvents, fetchDraftSupplyPointEvent, selectAllPointEvents, selectAllPointEventsStatus } from "../services/pointEvents/pointEventsSlice"
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