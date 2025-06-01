import React from "react";
import Home from "./HomePage/Component/Home";
import Notification from "./HomePage/Component/Notification";
import { Chat } from "./Chat/Chat";
import ListStudent from "./ListStudent/ListStudent";
import Chart from "./Chart/Chart";
import AddForm from "./ListStudent/Components/AddForm";
import InfoStudent from "./ListStudent/Components/InfoStudent";
import ImportData from "./ListStudent/Components/ImportData";
import Profile from "./Profile/Profile";
import ChangePassword from "./Profile/ChangePassword";

const routes = [
  {
    path: "/home/notification",
    exact: true,
    main: () => <Notification />,
  },

  {
    path: "/home/chat",
    exact: true,
    main: () => <Chat />,
  },
  {
    path: "/home/list-students",
    exact: true,
    main: () => <ListStudent />,
  },
  {
    path: "/home/chart",
    exact: true,
    main: () => <Chart />,
  },
  {
    path: "/home/list-students/add",
    exact: true,
    main: () => <AddForm />,
  },
  {
    path: "/home/list-students/update/:id",
    exact: true,
    main: ({ match, history }) => <InfoStudent match={match} history={history} />,
  },
  {
    path: "/home/list-students/import-data",
    exact: true,
    main: () => <ImportData />,
  },
  {
    path: "/home/profile",
    exact: true,
    main: ({ match }) => <Profile match={match} />,
  },
  {
    path: "/home",
    exact: true,
    main: () => <Home />,
  },
  {
    path: "/home/change-password",
    exact: true,
    main: () => <ChangePassword />,
  },
  {
    path: "/home/attendance",
    exact: true,
    main: () => {
      const Attendance = React.lazy(() => import('./Attendance/Attendance'));
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Attendance />
        </React.Suspense>
      );
    },
  },
  {
    path: "/home/attendance/stats",
    exact: true,
    main: () => {
      const AttendanceStats = React.lazy(() => import('./Attendance/AttendanceStats'));
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <AttendanceStats />
        </React.Suspense>
      );
    },
  },
  {
    path: "/home/attendance/recognition",
    exact: true,
    main: () => {
      const AttendanceRecognition = React.lazy(() => import('./Attendance/AttendanceRecognition'));
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <AttendanceRecognition />
        </React.Suspense>
      );
    },
  },
];

export default routes;
