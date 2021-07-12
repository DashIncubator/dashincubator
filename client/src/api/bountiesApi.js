import { dashincubatorRequest, RequestTypes } from "./serverRequest";

export const fetchBounties = async () => {
  const response = await dashincubatorRequest("bounties");
  return response.json();
};

export const fetchConcepts = async () => {
  const response = await dashincubatorRequest("bounties/concepts/public");
  return response.json();
};

export const fetchAllConcepts = async () => {
  const response = await dashincubatorRequest("bounties/concepts/all");
  return response.json();
};

export const createBounty = async (bounty) =>
  dashincubatorRequest("bounties/new", RequestTypes.Post, bounty);

export const getBountyActivity = async (id) =>
  dashincubatorRequest(`bounties/get/${id}/activity`, RequestTypes.Get);

export const updateBounty = (data) =>
  dashincubatorRequest(`bounties/update`, RequestTypes.Put, data);

export const getBounty = async (displayURL) =>
  dashincubatorRequest(`bounties/bounty/${displayURL}`, RequestTypes.Get);

export const commentBounty = (data, bountyId) =>
  dashincubatorRequest(`bounties/comment/${bountyId}`, RequestTypes.Put, data);

export const updateCommentBounty = (data, commentId) =>
  dashincubatorRequest(
    `bounties/comment-edit/${commentId}`,
    RequestTypes.Put,
    data
  );

export const updateCommentLastSeen = (id) => dashincubatorRequest(`bounties/comment/${id}/last-seen`, RequestTypes.Put);
