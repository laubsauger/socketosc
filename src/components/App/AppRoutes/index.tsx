import React, { Suspense, lazy } from 'react';
import { Route, Routes} from 'react-router-dom';
import { observer } from "mobx-react-lite";
import LoadingSpinner from "../../LoadingSpinner";
import DefaultLayout from "../Layouts/Default";

const HomePage = lazy(() => import('../Pages/Home'));
const SessionPage = lazy(() => import('../Pages/Session'));

const NotFoundPage = lazy(() => import('../Pages/NotFound'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <HomePage />
            </Suspense>
          }
        />

        <Route
          path='/session/:instanceId'
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SessionPage />
            </Suspense>
          }
        />

        {/* NOT FOUND catch all */}
        <Route
          path='*'
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
};

export default observer(AppRoutes);