import { post } from "./mainAction";

export const callList = (postData, req) => post(`place/nearbysearch`, postData, req);

export const callDetail = (postData, req) => post(`place/details`, postData, req);
