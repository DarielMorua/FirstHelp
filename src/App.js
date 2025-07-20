import React, { useState, useEffect } from "react";
import {
  Plus,
  User,
  Users,
  Bluetooth,
  Download,
  Search,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const TriageApp = () => {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterSex, setFilterSex] = useState("all");
  const [patients, setPatients] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // load data on initialization
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem("triagePatients");
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients));
      } else {
        // Example data if nothing is saved
        const examplePatients = [
          {
            id: 1,
            name: "Michael",
            age: 50,
            time: "09:30",
            date: "2025-07-19",
            priority: "stable",
            symptoms: "Mild arm pain",
            sex: "male",
            triageAnswers: {
              breathing: true,
              conscious: true,
              walking: true,
              bleeding: false,
            },
          },
          {
            id: 2,
            name: "Anna",
            age: 34,
            time: "09:15",
            date: "2025-07-19",
            priority: "urgent",
            symptoms: "Difficulty breathing",
            sex: "female",
            triageAnswers: {
              breathing: true,
              conscious: true,
              walking: false,
              bleeding: false,
            },
          },
          {
            id: 3,
            name: "Laura",
            age: 72,
            time: "09:00",
            date: "2025-07-19",
            priority: "critical",
            symptoms: "Severe chest pain",
            sex: "female",
            triageAnswers: {
              breathing: false,
              conscious: true,
              walking: false,
              bleeding: false,
            },
          },
        ];
        setPatients(examplePatients);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    }
    setIsLoaded(true);
  }, []);

  // save data whenever patients change (but not on first render)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("triagePatients", JSON.stringify(patients));
      } catch (error) {
        console.error("Error saving patients:", error);
      }
    }
  }, [patients, isLoaded]);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    sex: "male",
    symptoms: "",
  });
  const [triageAnswers, setTriageAnswers] = useState({
    breathing: null,
    pulse: null,
    conscious: null,
    walking: null,
    bleeding: null,
  });

  const sexLabels = {
    male: "Male",
    female: "Female",
  };

  // filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || patient.priority === filterPriority;
    const matchesSex = filterSex === "all" || patient.sex === filterSex;

    return matchesSearch && matchesPriority && matchesSex;
  });
  // export functions
  const exportToJSON = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triaje-pacientes-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Age",
      "Sex",
      "Date",
      "Time",
      "Priority",
      "Symptoms",
      "Breathing",
      "Conscious",
      "Walking",
      "Bleeding",
    ];
    const csvContent = [
      headers.join(","),
      ...patients.map((patient) =>
        [
          patient.id,
          `"${patient.name}"`,
          patient.age,
          sexLabels[patient.sex],
          patient.date,
          patient.time,
          patient.priority,
          `"${patient.symptoms}"`,
          patient.triageAnswers?.breathing ? "Yes" : "No",
          patient.triageAnswers?.conscious ? "Yes" : "No",
          patient.triageAnswers?.walking ? "Yes" : "No",
          patient.triageAnswers?.bleeding ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const dataBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triaje-pacientes-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToTXT = () => {
    const txtContent = patients
      .map(
        (patient) =>
          `PATIENT #${patient.id}
Name: ${patient.name}
Age: ${patient.age}
Sex: ${sexLabels[patient.sex]}
Date: ${patient.date}
Time: ${patient.time}
Priority: ${priorityLabels[patient.priority]}
Symptoms: ${patient.symptoms}
Triage assessment:
- Breathing: ${patient.triageAnswers?.breathing ? "Yes" : "No"}
- Conscious: ${patient.triageAnswers?.conscious ? "Yes" : "No"}
- Can walk: ${patient.triageAnswers?.walking ? "Yes" : "No"}
- Severe bleeding: ${patient.triageAnswers?.bleeding ? "Yes" : "No"}

-------------------
`
      )
      .join("\n");

    const dataBlob = new Blob([txtContent], {
      type: "text/plain;charset=utf-8;",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triaje-pacientes-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all patients? This action cannot be undone."
      )
    ) {
      setPatients([]);
      localStorage.removeItem("triagePatients");
    }
  };

  const priorityColors = {
    critical: "bg-red-500",
    urgent: "bg-yellow-500",
    stable: "bg-green-500",
  };

  const priorityLabels = {
    critical: "Critical",
    urgent: "Urgent",
    stable: "Stable",
  };

  const calculatePriority = () => {
    const { breathing, conscious, bleeding, walking } = triageAnswers;

    // validate that all triage questions have been answered
    if (
      breathing === null ||
      conscious === null ||
      bleeding === null ||
      walking === null
    ) {
      return null; // cannot determine priority without complete assessment
    }

    // Critical: Life-threatening conditions requiring immediate intervention
    // ABC (Airway, Breathing, Circulation) priorities
    if (breathing === false) {
      return "critical"; // Respiratory failure - highest priority
    }

    if (conscious === false) {
      return "critical"; // Unconscious patient - potential head injury, shock, or other serious conditions
    }

    // Urgent: Serious conditions that need prompt attention
    if (bleeding === true && walking === false) {
      return "critical"; // Severe bleeding + inability to walk suggests major trauma/hemorrhage
    }

    if (bleeding === true) {
      return "urgent"; // Severe bleeding but ambulatory - needs prompt hemostasis
    }

    if (walking === false) {
      return "urgent"; // Non-ambulatory patient - potential fractures, pain, or other mobility-limiting injuries
    }

    // Stable: Less urgent conditions that can wait for treatment
    return "stable"; // All vital signs stable, ambulatory, no severe bleeding
  };

  const handleSavePatient = () => {
    const priority = calculatePriority();

    // check if all triage questions have been answered
    if (priority === null) {
      alert("Please answer all triage questions before saving the patient.");
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = now.toISOString().split("T")[0];

    const patient = {
      id: Date.now(),
      ...newPatient,
      time,
      date,
      priority,
      triageAnswers: { ...triageAnswers },
    };

    setPatients((prev) => [patient, ...prev]);
    setNewPatient({ name: "", age: "", sex: "male", symptoms: "" });
    setTriageAnswers({
      breathing: null,
      pulse: null,
      conscious: null,
      walking: null,
      bleeding: null,
    });
    setCurrentScreen("patients");
  };

  return (
    <div className="font-sans">
      {currentScreen === "main" && (
        <MainScreen setCurrentScreen={setCurrentScreen} />
      )}
      {currentScreen === "register" && (
        <RegisterScreen
          setCurrentScreen={setCurrentScreen}
          newPatient={newPatient}
          setNewPatient={setNewPatient}
        />
      )}
      {currentScreen === "triage" && (
        <TriageScreen
          setCurrentScreen={setCurrentScreen}
          triageAnswers={triageAnswers}
          setTriageAnswers={setTriageAnswers}
          priorityColors={priorityColors}
          priorityLabels={priorityLabels}
          calculatePriority={calculatePriority}
          handleSavePatient={handleSavePatient}
        />
      )}
      {currentScreen === "patients" && (
        <PatientsScreen
          setCurrentScreen={setCurrentScreen}
          patients={patients}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterSex={filterSex}
          setFilterSex={setFilterSex}
          filteredPatients={filteredPatients}
          exportToJSON={exportToJSON}
          exportToCSV={exportToCSV}
          exportToTXT={exportToTXT}
          clearAllData={clearAllData}
          priorityColors={priorityColors}
          priorityLabels={priorityLabels}
          sexLabels={sexLabels}
        />
      )}
    </div>
  );
};

const MainScreen = ({ setCurrentScreen }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/logo1.png"
            alt="FirstHelp Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">FirstHelp</h1>
        <p className="text-gray-600">Emergency medical triage</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setCurrentScreen("register")}
          className="w-full bg-blue-500 text-white p-4 rounded-lg flex items-center justify-between hover:bg-blue-600 transition-colors"
        >
          <div className="flex items-center">
            <User className="w-6 h-6 mr-3" />
            <span className="text-lg font-medium">New patient</span>
          </div>
        </button>

        <button
          onClick={() => setCurrentScreen("patients")}
          className="w-full bg-teal-500 text-white p-4 rounded-lg flex items-center justify-between hover:bg-teal-600 transition-colors"
        >
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3" />
            <span className="text-lg font-medium">View patients</span>
          </div>
        </button>
      </div>
    </div>
  </div>
);

const RegisterScreen = ({ setCurrentScreen, newPatient, setNewPatient }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setCurrentScreen("main")} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">New patient</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={newPatient.name}
            onChange={(e) =>
              setNewPatient((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Patient name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={newPatient.age}
            onChange={(e) =>
              setNewPatient((prev) => ({ ...prev, age: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sex
          </label>
          <select
            value={newPatient.sex}
            onChange={(e) =>
              setNewPatient((prev) => ({ ...prev, sex: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main symptoms
          </label>
          <textarea
            value={newPatient.symptoms}
            onChange={(e) =>
              setNewPatient((prev) => ({ ...prev, symptoms: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Symptom description"
          />
        </div>

        <button
          onClick={() => setCurrentScreen("triage")}
          disabled={!newPatient.name || !newPatient.age}
          className="w-full bg-blue-500 text-white p-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to triage
        </button>
      </div>
    </div>
  </div>
);

const TriageScreen = ({
  setCurrentScreen,
  triageAnswers,
  setTriageAnswers,
  priorityColors,
  priorityLabels,
  calculatePriority,
  handleSavePatient,
}) => {
  const questions = [
    {
      key: "breathing",
      question: "Is the patient breathing?",
      critical: true,
    },
    {
      key: "conscious",
      question: "Is the patient conscious?",
      critical: true,
    },
    { key: "walking", question: "Can the patient walk?", critical: false },
    {
      key: "bleeding",
      question:
        "Does the patient have severe wounds, open fractures, or active bleeding?",
      critical: true,
      inverted: true,
    },
  ];

  const currentQuestionIndex = questions.findIndex(
    (q) => triageAnswers[q.key] === null
  );
  const isComplete = currentQuestionIndex === -1;

  if (isComplete) {
    const priority = calculatePriority();
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCurrentScreen("register")}
              className="mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Triage result</h2>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="text-center">
              <div
                className={`w-20 h-20 ${priorityColors[priority]} rounded-full mx-auto mb-4 flex items-center justify-center`}
              >
                <span className="text-white font-bold text-xl">
                  {priority[0].toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {priorityLabels[priority]}
              </h3>
              <p className="text-gray-600">
                {priority === "critical" &&
                  "Life-threatening condition requiring immediate medical intervention. ABC (Airway, Breathing, Circulation) compromise detected."}
                {priority === "urgent" &&
                  "Serious condition requiring prompt medical attention. Patient needs priority treatment but condition is stable."}
                {priority === "stable" &&
                  "Non-urgent condition. Patient can safely wait for treatment. All vital signs are stable."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSavePatient}
              className="w-full bg-green-500 text-white p-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Save patient
            </button>
            <button
              onClick={() => setCurrentScreen("register")}
              className="w-full bg-gray-300 text-gray-700 p-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Modify data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => setCurrentScreen("register")} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Triage</h2>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < currentQuestionIndex
                    ? "bg-blue-500"
                    : index === currentQuestionIndex
                    ? "bg-blue-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Real-time priority indicator */}
        {currentQuestionIndex > 0 &&
          (() => {
            const currentPriority = calculatePriority();
            if (currentPriority) {
              return (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 ${priorityColors[currentPriority]} rounded-full`}
                    ></div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Current assessment:
                      </p>
                      <p className="font-medium text-gray-800">
                        {priorityLabels[currentPriority]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-6 text-center">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            <button
              onClick={() =>
                setTriageAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.key]: true,
                }))
              }
              className="w-full p-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() =>
                setTriageAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.key]: false,
                }))
              }
              className="w-full p-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientsScreen = ({
  setCurrentScreen,
  patients,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  filterSex,
  setFilterSex,
  filteredPatients,
  exportToJSON,
  exportToCSV,
  exportToTXT,
  clearAllData,
  priorityColors,
  priorityLabels,
  sexLabels,
}) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => setCurrentScreen("main")} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Patients</h2>
        </div>
        <button onClick={() => setCurrentScreen("register")}>
          <Plus className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      <div className="mb-4">
        <div className="relative mb-3">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or symptoms"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="stable">Stable</option>
          </select>

          <select
            value={filterSex}
            onChange={(e) => setFilterSex(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export data
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={exportToJSON}
              className="p-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              JSON
            </button>
            <button
              onClick={exportToCSV}
              className="p-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={exportToTXT}
              className="p-2 bg-purple-500 text-white rounded text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              TXT
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3">Data management</h3>
          <div className="space-y-2">
            <button className="w-full p-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Bluetooth className="w-4 h-4 mr-2" />
              Share via Bluetooth
            </button>
            <button
              onClick={clearAllData}
              className="w-full p-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Clear all data
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Total patients:</strong> {patients.length} |{" "}
            <strong>Showing:</strong> {filteredPatients.length}
          </p>
          <div className="flex space-x-4 text-xs">
            <span className="text-red-600">
              Critical:{" "}
              {patients.filter((p) => p.priority === "critical").length}
            </span>
            <span className="text-yellow-600">
              Urgent: {patients.filter((p) => p.priority === "urgent").length}
            </span>
            <span className="text-green-600">
              Stable: {patients.filter((p) => p.priority === "stable").length}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">
              No patients found matching the filters
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium text-gray-800 mr-2">
                      {patient.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {patient.age} years • {sexLabels[patient.sex]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {patient.symptoms}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {patient.date} {patient.time}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        priorityColors[patient.priority]
                      }`}
                    >
                      {priorityLabels[patient.priority]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default TriageApp;
