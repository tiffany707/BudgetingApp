import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Upload from './pages/Upload';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import TransactionFilter from './components/TransactionsFilter';
import Layout from './components/Layout';

const router = createBrowserRouter([
   {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'upload', element: <Upload /> },
      { path: 'filter', element: <TransactionFilter /> },
    ],
  },  
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
