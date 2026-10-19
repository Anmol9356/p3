
const $ = (id) => document.getElementById(id);

// Fictional names for generating sample student records
const firstNames = [
  "Alex", "Jamie", "Riley", "Morgan", "Taylor",
  "Jordan", "Casey", "Avery", "Cameron", "Drew",
  "Sam", "Robin", "Skyler", "Parker", "Quinn",
  "Reese", "Dakota", "Charlie", "Aria", "Noah",
  "Mia", "Ethan", "Zoe", "Ishaan", "Anaya",
  "Kabir", "Diya", "Aarav", "Sara", "Rohan",
  "Meera", "Dev", "Ira", "Priya", "Rahul"
];

const lastNames = [
  "Morgan", "Taylor", "Jordan", "Patel", "Shah",
  "Singh", "Mehta", "Rao", "Khan", "Joshi",
  "Brown", "Wilson", "Lee", "Martin", "Clark",
  "Lewis", "Walker", "Hall", "Young", "Allen",
  "Desai", "Kulkarni", "Nair", "Kapoor", "Gupta"
];

// Course categories
const courses = {
  technology: [
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Cybersecurity",
    "Software Engineering"
  ],
  business: [
    "Business Administration",
    "Accounting",
    "Marketing",
    "Finance",
    "Human Resources"
  ],
  science: [
    "Biology",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Environmental Science"
  ]
};

let dataset = [];
let hasValidated = false;

// Generate a random integer between minimum and maximum
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Select a random item from an array
function pick(array) {
  return array[randomInt(0, array.length - 1)];
}

// Calculate the grade based on marks
function gradeFor(marks) {
  if (marks >= 90) return "A";
  if (marks >= 80) return "B";
  if (marks >= 70) return "C";
  if (marks >= 60) return "D";
  return "F";
}

// Display messages to the user
function showMessage(text, isError = true) {
  const message = $("message");

  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle("success", !isError);
}

// Get courses according to the selected category
function selectedCourses() {
  const category = $("courseFilter").value;

  if (category === "all") {
    return Object.values(courses).flat();
  }

  return courses[category];
}

// Generate the synthetic student dataset
function generateDataset() {
  const count = Number($("recordCount").value);

  // Validate the requested number of records
  if (
    !Number.isInteger(count) ||
    count < 30 ||
    count > 1000
  ) {
    showMessage(
      "Please enter a whole number from 30 to 1,000."
    );
    $("recordCount").focus();
    return;
  }

  const courseList = selectedCourses();

  // Create fictional student records
  dataset = Array.from({ length: count }, (_, i) => {
    const marks = randomInt(35, 100);

    return {
      "Student ID": `STU-${String(1001 + i).padStart(4, "0")}`,
      "Student Name": `${pick(firstNames)} ${pick(lastNames)}`,
      "Age": randomInt(17, 25),
      "Course": pick(courseList),
      "Marks": marks,
      "Attendance Percentage": randomInt(60, 100),
      "Grade": gradeFor(marks)
    };
  });

  hasValidated = false;

  $("validateBtn").disabled = false;
  $("downloadBtn").disabled = false;

  showMessage(
    `Successfully generated ${count} fictional student records.`,
    false
  );

  renderDataset();
  resetValidation();
}

// Display the generated dataset in the HTML table
function renderDataset() {
  const body = $("tableBody");

  body.innerHTML = "";

  // Show a maximum of 100 rows in the preview
  dataset.slice(0, 100).forEach((record) => {
    const row = document.createElement("tr");

    Object.values(record).forEach((value, index) => {
      const cell = document.createElement("td");

      if (index === 0) {
        cell.className = "student-id";
        cell.textContent = value;
      } else if (index === 6) {
        const badge = document.createElement("span");

        badge.className = "grade";
        badge.textContent = value;

        cell.appendChild(badge);
      } else {
        cell.textContent =
          index === 5 ? `${value}%` : value;
      }

      row.appendChild(cell);
    });

    body.appendChild(row);
  });

  // Update dashboard statistics
  $("tableSubtitle").textContent =
    `${dataset.length} records generated · previewing up to 100 rows`;

  $("showingText").textContent =
    `Showing ${Math.min(dataset.length, 100)} of ${dataset.length} records`;

  $("totalStat").textContent =
    dataset.length.toLocaleString();

  const average =
    dataset.reduce((sum, record) => sum + record.Marks, 0) /
    dataset.length;

  $("averageStat").textContent = average.toFixed(1);

  $("coursesStat").textContent =
    new Set(dataset.map(record => record.Course)).size;

  $("statusStat").textContent =
    hasValidated ? "Checked" : "Pending";

  $("statusStat").style.color =
    hasValidated ? "#159774" : "#8b93a5";
}

// Reset the validation report when a new dataset is generated
function resetValidation() {
  $("validationEmpty").hidden = false;
  $("validationReport").hidden = true;

  $("validationEmpty").textContent =
    "Run “Validate dataset” to check missing values, duplicate records, data types, and consistency.";

  $("statusStat").textContent = "Pending";
  $("statusStat").style.color = "#8b93a5";
}

// Validate the generated student records
function validateDataset() {
  if (dataset.length === 0) {
    showMessage("Generate a dataset before validating it.");
    return;
  }

  const fields = [
    "Student ID",
    "Student Name",
    "Age",
    "Course",
    "Marks",
    "Attendance Percentage",
    "Grade"
  ];

  let missing = 0;
  let typeErrors = 0;
  let consistencyErrors = 0;

  const seen = new Set();
  let duplicates = 0;

  dataset.forEach((record) => {
    // Check missing values
    fields.forEach((field) => {
      if (
        record[field] === null ||
        record[field] === undefined ||
        record[field] === ""
      ) {
        missing++;
      }
    });

    // Check duplicate complete records
    const signature = fields
      .map(field => String(record[field]))
      .join("|");

    if (seen.has(signature)) {
      duplicates++;
    }

    seen.add(signature);

    // Check expected data types
    if (
      typeof record["Student ID"] !== "string" ||
      typeof record["Student Name"] !== "string" ||
      typeof record.Age !== "number" ||
      typeof record.Course !== "string" ||
      typeof record.Marks !== "number" ||
      typeof record["Attendance Percentage"] !== "number" ||
      typeof record.Grade !== "string"
    ) {
      typeErrors++;
    }

    // Check ranges, grade and student ID consistency
    if (
      record.Age < 17 ||
      record.Age > 25 ||
      record.Marks < 0 ||
      record.Marks > 100 ||
      record["Attendance Percentage"] < 0 ||
      record["Attendance Percentage"] > 100 ||
      record.Grade !== gradeFor(record.Marks) ||
      !record["Student ID"].startsWith("STU-")
    ) {
      consistencyErrors++;
    }
  });

  const errors = typeErrors + consistencyErrors;

  const passed =
    missing === 0 &&
    duplicates === 0 &&
    errors === 0;

  hasValidated = true;

  // Display the validation report
  $("validationEmpty").hidden = true;
  $("validationReport").hidden = false;

  $("validationBanner").classList.toggle(
    "fail",
    !passed
  );

  $("validationIcon").textContent =
    passed ? "✓" : "!";

  $("validationTitle").textContent =
    passed ? "Validation passed" : "Issues detected";

  $("validationDescription").textContent =
    passed
      ? "All checked records meet the prototype's required data rules."
      : "Review the counts below and investigate any flagged records.";

  $("reportTotal").textContent = dataset.length;
  $("reportMissing").textContent = missing;
  $("reportDuplicates").textContent = duplicates;
  $("reportErrors").textContent = errors;

  // Explain each validation result
  const details = [
    `Required-field check: ${
      missing === 0
        ? "passed — no missing values"
        : `${missing} missing values found`
    }.`,
    `Duplicate check: ${
      duplicates === 0
        ? "passed — no duplicate full records"
        : `${duplicates} duplicate full records found`
    }.`,
    `Data types: ${
      typeErrors === 0
        ? "passed — fields have expected JavaScript types"
        : `${typeErrors} records have type issues`
    }.`,
    `Consistency rules: ${
      consistencyErrors === 0
        ? "passed — age, marks, attendance, grade and ID rules are consistent"
        : `${consistencyErrors} records have consistency issues`
    }.`
  ];

  const list = $("validationDetails");
  list.innerHTML = "";

  details.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });

  $("statusStat").textContent =
    passed ? "Passed" : "Issues";

  $("statusStat").style.color =
    passed ? "#159774" : "#b93e4b";

  showMessage(
    passed
      ? "Validation completed successfully."
      : "Validation completed; please review the report.",
    !passed
  );
}

// Download the dataset as a CSV file
function downloadCSV() {
  if (dataset.length === 0) {
    showMessage("Generate a dataset before downloading a CSV file.");
    return;
  }

  const fields = [
    "Student ID",
    "Student Name",
    "Age",
    "Course",
    "Marks",
    "Attendance Percentage",
    "Grade"
  ];

  // Escape quotes correctly for CSV format
  const quote = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const rows = [
    fields.map(quote).join(","),
    ...dataset.map((record) =>
      fields.map(field => quote(record[field])).join(",")
    )
  ];

  // Add UTF-8 BOM for spreadsheet compatibility
  const blob = new Blob(
    ["\uFEFF" + rows.join("\r\n")],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "synthetic_student_dataset.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showMessage("CSV download started.", false);
}

// Connect the buttons to their functions
$("generateBtn").addEventListener(
  "click",
  generateDataset
);

$("validateBtn").addEventListener(
  "click",
  validateDataset
);

$("downloadBtn").addEventListener(
  "click",
  downloadCSV
);

// Decrease record count without going below 30
$("minusBtn").addEventListener("click", () => {
  const current = Number($("recordCount").value) || 30;

  $("recordCount").value = Math.max(30, current - 10);
});

// Increase record count without going above 1,000
$("plusBtn").addEventListener("click", () => {
  const current = Number($("recordCount").value) || 30;

  $("recordCount").value = Math.min(1000, current + 10);
});

// Validate manual changes to the record count
$("recordCount").addEventListener("change", () => {
  const value = Number($("recordCount").value);

  if (
    !Number.isInteger(value) ||
    value < 30 ||
    value > 1000
  ) {
    showMessage("Please enter a whole number from 30 to 1,000.");
  } else {
    showMessage("");
  }
});

// Regenerate the dataset when the course category changes
$("courseFilter").addEventListener("change", () => {
  if (dataset.length > 0) {
    generateDataset();
  }
});

// Allow Enter to generate the dataset
$("recordCount").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateDataset();
  }
});
