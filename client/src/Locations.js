export const RootLocation = "/";

export const LoginLocation = "/login";
export const RegisterLocation = "/register";

export const ConceptsLocation = "/concepts";

export const RequestNewConceptLocation = "/request-new-concept";

export const ConceptLocationTemplate = "/concept/:id";
export const ConceptLocation = (id) => `/concept/${id}`;

export const EditConceptLocationTemplate = "/concept/:id/edit";
export const EditConceptLocation = (id) => `/concept/${id}/edit`;

export const ApproveConceptLocationTemplate = "/concept/:id/approve";
export const ApproveConceptLocation = (id) => `/concept/${id}/approve`;

export const BountiesLocation = "/bounties";

export const BountyLocationTemplate = "/bounty/:id";
export const BountyLocation = (id) => `/bounty/${id}`;

export const EditBountyLocationTemplate = "/bounty/:id/edit";
export const EditBountyLocation = (id) => `/bounty/${id}/edit`;

export const PaymentsLocation = "/payments";

export const ProfileLocationTemplate = `/user/:username`;
export const ProfileLocation = (username) => `/user/${username}`;

export const ActivityLocation = "/activity";

export const DashboardLocation = "/dashboard";

export const UserManagementLocation = "/user-management";

export const UpdatePasswordLocation =
  "/update-password/:uid([0-9a-f]+)-:hashCode([0-9a-f]+)";

export const ResetPasswordLocation = "/reset-password";
