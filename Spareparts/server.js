const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const csv = require("csv-parser");

const app = express();
app.use(cors());

let data = [];

// Read CSV file into memory
fs.createReadStream("LE.txt")
  .pipe(csv())
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

// Base endpoint for spare parts
app.get("/spare-parts", (req, res) => {
  let { page = 1, sort = null, name = null, sn = null } = req.query;
  page = parseInt(page);

  // Pagination
  const perPage = 30;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  // Filtering
  let filteredData = data;
  if (name) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  if (sn) {
    filteredData = filteredData.filter((item) => item.sn === sn);
  }

  // Sorting
  if (sort) {
    const sortDirection = sort.startsWith("-") ? "desc" : "asc";
    const sortField = sortDirection === "desc" ? sort.substring(1) : sort;
    filteredData.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Return paginated and filtered data
  res.json(filteredData.slice(start, end));
});

const PORT = 3300;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
