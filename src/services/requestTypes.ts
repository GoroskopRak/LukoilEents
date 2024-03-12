export type RequestState = 'pending' | 'fulfilled' | 'rejected' | undefined

export interface RequestInterface<T> {
	onSuccess?: (data?: T) => void
	onError?: () => void
}

export interface LazyLoadableHook {
	lazyLoad?: boolean
}