const fetchData = async () => {
  try {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcxOTk5NzMxOCwiZXhwIjoxNzIwMDAwOTE4fQ.joVJapkE2A318H8UjPOp0mecMsJrucqREMk03IQC3KE";

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
