import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },

  {
    path: '/upload',
    element: <Upload />
  },

  {
    path: '/dashboard',
    element: <Dashboard />
  },


  {
    path: '*',
    element: <NotFoundPage />
  },

  
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
