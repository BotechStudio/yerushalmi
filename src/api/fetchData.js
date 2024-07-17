const fetchData = async () => {
  try {
    //need to generate from the SERVER
    const token = import.meta.env.VITE_TOKEN;

    const response = await fetch(
      "http://server.yerushalmi.online/yerushalmi/diamonds",
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
