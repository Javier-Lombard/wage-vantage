import { configureStore } from '@reduxjs/toolkit';

import { wageApi } from '@/features/salary-comparator';

export const store = configureStore({
  reducer: {
    [wageApi.reducerPath]: wageApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(wageApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
