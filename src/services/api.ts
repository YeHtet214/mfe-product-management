import axios from "axios";

export const baseURL = import.meta.env.VITE_API_BASE_URL || "http://mfe-server.test";
export const authURL = import.meta.env.VITE_AUTH_URL || "http://auth.mfe-server.test:5173";
export const clientId = import.meta.env.VITE_SSO_CLIENT_ID || "product-app";

const api = axios.create({
	baseURL: baseURL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
	localStorage.removeItem(TOKEN_KEY);
}

export function extractTokenFromUrl(): string | null {
	const hash = window.location.hash;
	if (!hash) return null;
	const match = hash.match(/#token=([^&]+)/);
	if (match) {
		return match[1];
	}
	return null;
}

export function clearUrlHash(): void {
	if (window.location.hash) {
		const url = window.location.href.replace(/#.*$/, "");
		window.history.replaceState(null, "", url);
	}
}

function initToken(): void {
	const urlToken = extractTokenFromUrl();
	if (urlToken) {
		setToken(urlToken);
		clearUrlHash();
	}
}
initToken();

api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response) {
			const { status, data } = error.response;

			if (status === 401) {
				removeToken();
				const currentUrl = window.location.href;
				window.location.href = `${authURL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(currentUrl)}`;
			} else if (status === 403) {
				if (data.message?.toLowerCase().includes("inactive")) {
					removeToken();
					const currentUrl = window.location.href;
					window.location.href = `${authURL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(currentUrl)}`;
				}
			} else if (status === 500) {
				console.error("Internal Server Error:", data.message);
			}
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request error:", error.message);
		}

		return Promise.reject(error);
	}
);

export default api;
