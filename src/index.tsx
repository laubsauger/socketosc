import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './contexts/storeContext';

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-dark-5/dist/css/bootstrap-night.css";
import './index.scss';
import App from './components/App';
import {RootStore} from "./stores/rootStore";
// @ts-ignore
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider store={new RootStore()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
