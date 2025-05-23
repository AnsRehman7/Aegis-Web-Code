import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar";
import HeroSection from "./components/hero-aria";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ConnectApp from "./components/Dashboard/ConnectApp";
import Activities from "./components/Dashboard/Activities";
import ScreenTime from "./components/Dashboard/Activities/ScreenTime";
import Location from "./components/Dashboard/Activities/Location";
import ContentFiltering from "./components/Dashboard/Activities/ContentFiltering";
import ErrorPage from "./components/ErrorPage";
import { FirebaseProvider } from "./context/Firebase";

const router = createBrowserRouter([
  {
    path: "/",
    element: <><Navbar /><HeroSection /></>,
    errorElement: <ErrorPage />
  },
  { 
    path: "/login", 
    element: <Login />,
    errorElement: <ErrorPage />
  },
  { 
    path: "/signup", 
    element: <Signup />,
    errorElement: <ErrorPage />
  },
  { 
    path: "/dashboard", 
    element: <Dashboard />,
    errorElement: <ErrorPage />,
    children: [
      { 
        path: "activities/:childId", 
        element: <Activities />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "screen-time",
            element: <ScreenTime />,
            errorElement: <ErrorPage />
          },
          {
            path: "location",
            element: <Location />,
            errorElement: <ErrorPage />
          },
          {
            path: "content-filtering",
            element: <ContentFiltering />,
            errorElement: <ErrorPage />
          },
          {
            index: true,
            element: <ScreenTime /> // Default to Screen Time
          }
        ]
      }
    ]
  },
  { 
    path: "/connectApp", 
    element: <ConnectApp />,
    errorElement: <ErrorPage />
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FirebaseProvider>
      <RouterProvider router={router} />
    </FirebaseProvider>
  </React.StrictMode>
);