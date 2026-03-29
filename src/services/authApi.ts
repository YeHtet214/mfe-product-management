import api, { removeToken } from "./api";
import { storage } from "./storage";

export const logout = async () => {

	try {
		await api.post("/logout", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
		removeToken();
		storage.removeUser();
	} catch (error) {
		console.error("Error logging out:", error);
	}
};
