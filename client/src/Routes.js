import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import {
  ConceptsLocation,
  ConceptLocationTemplate,
  RequestNewConceptLocation,
  RootLocation,
  EditConceptLocationTemplate,
  ApproveConceptLocationTemplate,
  BountyLocationTemplate,
  EditBountyLocationTemplate,
  PaymentsLocation,
  ProfileLocationTemplate,
  ActivityLocation,
  DashboardLocation,
  UserManagementLocation,
  ResetPasswordLocation,
  UpdatePasswordLocation, BountiesLocation,
} from "./Locations";
import ScrollToTop from "./utils/ScrollToTop";
import useGlobalState from "./state";
import HomeView from "./views/Home";
import { getAuthToken } from "./api/serverRequest";
import LoginView from "./views/Login";
import { LoginLocation } from "./Locations";
import RequestNewConceptView from "./views/RequestNewConcept";
import ConceptView from "./views/Concept";
import ConceptsView from "./views/Concepts";
import BountyView from "./views/Bounty";
import PaymentsView from "./views/Payments";
import ProfileView from "./views/Profile";
import ActivityView from "./views/Activity";
import DashboardView from "./views/Dashboard";
import UserManagementView from "./views/UserManagement";
import ResetPasswordView from "./views/ResetPassword";
import UpdatePasswordView from "./views/UpdatePassword";
import BountiesView from "./views/Bounties";

function isAuthMatch(withAuth, loggedInUser, token) {
  if (!withAuth) {
    return true;
  }
  if (token) {
    return true;
  }
  return withAuth && loggedInUser;
}

const CustomRoute = (props) => {
  const { path, redirect, withAuth, component, ...leftProps } = props;
  const { loggedInUser } = useGlobalState();

  const token = getAuthToken();

  if (!isAuthMatch(withAuth, loggedInUser, token)) {
    let to = LoginLocation;
    return <Redirect from={path} to={to} {...leftProps} />;
  }

  if (redirect) {
    return <Redirect from={path} to={redirect} {...leftProps} />;
  }

  //return <Route path={path} component={error.error ? ErrorView : component} />;
  return <Route path={path} component={component} />;
};

const routes = [
  {
    path: RootLocation,
    exact: true,
    withAuth: true,
    component: HomeView,
  },
  { path: LoginLocation, exact: true, component: LoginView },
  {
    path: ConceptsLocation,
    exact: true,
    withAuth: true,
    component: ConceptsView,
  },
  {
    path: BountiesLocation,
    exact: true,
    withAuth: true,
    component: BountiesView,
  },
  {
    path: RequestNewConceptLocation,
    exact: true,
    withAuth: true,
    component: RequestNewConceptView,
  },
  {
    path: PaymentsLocation,
    exact: true,
    withAuth: true,
    component: PaymentsView,
  },
  {
    path: ConceptLocationTemplate,
    exact: true,
    withAuth: true,
    component: ConceptView,
  },
  {
    path: EditConceptLocationTemplate,
    exact: true,
    withAuth: true,
    component: ConceptView,
  },
  {
    path: ProfileLocationTemplate,
    exact: true,
    withAuth: true,
    component: ProfileView,
  },
  {
    path: ApproveConceptLocationTemplate,
    exact: true,
    withAuth: true,
    component: ConceptView,
  },
  {
    path: BountyLocationTemplate,
    exact: true,
    withAuth: true,
    component: BountyView,
  },
  {
    path: EditBountyLocationTemplate,
    exact: true,
    withAuth: true,
    component: BountyView,
  },
  {
    path: ActivityLocation,
    exact: true,
    withAuth: true,
    component: ActivityView,
  },
  {
    path: DashboardLocation,
    exact: true,
    withAuth: true,
    component: DashboardView,
  },
  {
    path: UserManagementLocation,
    exact: true,
    withAuth: true,
    component: UserManagementView,
  },
  {
    path: ResetPasswordLocation,
    exact: true,
    withAuth: false,
    component: ResetPasswordView,
  },
  {
    path: UpdatePasswordLocation,
    exact: true,
    withAuth: false,
    component: UpdatePasswordView,
  },
];

export default function Routes() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {routes.map((props) => (
          <CustomRoute key={props.path || "default"} {...props} />
        ))}
      </Switch>
    </>
  );
}
