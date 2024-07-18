import AuthService from "src/app/auth/services/AuthService";

const fetchData = async () => {
  try {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(
      "https://server.yerushalmi.online/yerushalmi/diamonds",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default fetchData;
