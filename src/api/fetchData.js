const fetchData = async () => {
  try {
    const token =
<<<<<<< HEAD
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcyMDM2MTg1OSwiZXhwIjoxNzIwMzY1NDU5fQ.dkCO6mmBg7Z26I9ZVHpGi6X7ONtdnUaAnJUxVi9xwMw";
=======
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcxOTk5NzMxOCwiZXhwIjoxNzIwMDAwOTE4fQ.joVJapkE2A318H8UjPOp0mecMsJrucqREMk03IQC3KE";
>>>>>>> 98254c3f885e85c193b3b0c56b4ccc4625b8df4e

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
