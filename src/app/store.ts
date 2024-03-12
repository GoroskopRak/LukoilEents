import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { loginSlice } from '../services/loginSlice';

export const store = configureStore({
  reducer: {
    Login: loginSlice.reducer,
  },
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			immutableCheck: { warnAfter: 128 },
			serializableCheck: { warnAfter: 128 },
		}),
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
