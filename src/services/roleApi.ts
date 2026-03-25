import api from "./api";
import type { PaginatedResponse, Role } from "./types";

export interface RoleListResponse {
	data: Role[];
}

export interface FetchRolesOptions {
	dropdown?: number;
}

export const fetchRoles = async (params?: { 
  search?: string; 
  dropdown?: number; 
  per_page?: number; 
  page?: number; 
}): Promise<PaginatedResponse<Role> | { data: Role[] }> => {
  const response = await api.get('/api/roles', { params });
  return response.data;
};
