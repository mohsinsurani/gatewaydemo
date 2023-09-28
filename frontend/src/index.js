import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Admin_control from "./components/admin_control";
import GatewayList from "./components/gateway_list";

import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

//Handles 3 screens for routing
const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "admin",
    element: <Admin_control/>,
  },
    {
    path: "gateway",
    element: <GatewayList/>,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//       <RouterProvider router={router} />
// );
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
