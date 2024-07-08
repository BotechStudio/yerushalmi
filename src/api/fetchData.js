const fetchData = async () => {
  try {
    //need to generate from the SERVER
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcyMDQ0NjgwMSwiZXhwIjoxNzIwNDUwNDAxfQ.eGr_ChZv9MjWp0kMBA6zUXlirGxJsnTlk-GXsp559dk";

    const response = await fetch("http://localhost:5000/yerushalmi/diamonds", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
