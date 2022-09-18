import React, { Suspense, lazy } from 'react';
import { Route, Routes} from 'react-router-dom';
import { observer } from "mobx-react-lite";
import LoadingSpinner from "../../LoadingSpinner";
import DefaultLayout from "../Layouts/Default";

const HomePage = lazy(() => import('../Pages/Home'));
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