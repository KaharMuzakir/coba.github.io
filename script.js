// Initialize Real-Time Chart
const realtimeCtx = document.getElementById('realtimeChart').getContext('2d');
let realtimeChart = new Chart(realtimeCtx, {
    type: 'line',
    data: {
        labels: [], // Timestamps
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#3f51b5',
                fill: false,
            },
            {
                label: 'Color Sensor',
                data: [],
                borderColor: '#4caf50',
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { title: { display: true, text: 'Value' } },
        },
    },
});

// Store experiments
let experiments = [];
let currentExperiment = null;
let monitoringInterval = null;
let updateInterval = null;

// Start a new experiment
function startExperiment(withHeater) {
    // Reset monitoring section
    resetMonitoring();

    // Initialize new experiment
    currentExperiment = {
        startTime: new Date().toLocaleString(),
        withHeater: withHeater,
        data: [],
        labels: [],
        temperature: [],
        stirrerSpeed: [],
        colorSensor: [],
        heaterStatus: [],
    };
    experiments.push(currentExperiment);
    updateExperimentList();

    // Start monitoring (data collection every 1 second)
    monitoringInterval = setInterval(collectData, 1000);

    // Start updates (every 30 seconds)
    updateInterval = setInterval(updateData, 30000);
}

// Stop the current experiment
function stopExperiment() {
    if (currentExperiment) {
        // Stop monitoring and updates
        clearInterval(monitoringInterval);
        clearInterval(updateInterval);
        monitoringInterval = null;
        updateInterval = null;

        // Reset monitoring section
        resetMonitoring();

        // Save the current experiment
        currentExperiment = null;
        updateExperimentList();
    }
}

// Reset monitoring section
function resetMonitoring() {
    // Clear real-time chart
    realtimeChart.destroy();
    realtimeChart = new Chart(realtimeCtx, {
        type: 'line',
        data: {
            labels: [], // Timestamps
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#3f51b5',
                    fill: false,
                },
                {
                    label: 'Color Sensor',
                    data: [],
                    borderColor: '#4caf50',
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { title: { display: true, text: 'Value' } },
            },
        },
    });

    // Clear monitoring data
    document.getElementById('currentTemp').textContent = '--';
    document.getElementById('currentSpeed').textContent = '--';
    document.getElementById('colorSensor').textContent = '--';
}

// Collect data every 1 second
function collectData() {
    if (!currentExperiment) return;

    const time = new Date().toLocaleTimeString();
    const temp = Math.random() * 30 + 20; // Simulated temperature
    const speed = document.getElementById('stirrer-speed').value; // Get selected stirrer speed
    const color = Math.floor(Math.random() * 255); // Simulated color sensor reading
    const heaterStatus = currentExperiment.withHeater ? 'On' : 'Off'; // Heater status

    // Update Monitoring Section
    document.getElementById('currentTemp').textContent = temp.toFixed(2);
    document.getElementById('currentSpeed').textContent = ['Off', 'Slow', 'Medium', 'Fast'][speed];
    document.getElementById('colorSensor').textContent = color;

    // Save Data to Current Experiment
    currentExperiment.labels.push(time);
    currentExperiment.temperature.push(temp);
    currentExperiment.stirrerSpeed.push(speed);
    currentExperiment.colorSensor.push(color);
    currentExperiment.heaterStatus.push(heaterStatus);
    currentExperiment.data.push({ time, temp, speed, color, heaterStatus });
}

// Update data every 30 seconds
function updateData() {
    if (!currentExperiment) return;

    // Get the latest data points (every 30 seconds)
    const latestLabels = currentExperiment.labels.filter((_, index) => index % 30 === 0);
    const latestTemperature = currentExperiment.temperature.filter((_, index) => index % 30 === 0);
    const latestColorSensor = currentExperiment.colorSensor.filter((_, index) => index % 30 === 0);
    const latestData = currentExperiment.data.filter((_, index) => index % 30 === 0);

    // Update Real-Time Chart
    realtimeChart.data.labels = latestLabels;
    realtimeChart.data.datasets[0].data = latestTemperature;
    realtimeChart.data.datasets[1].data = latestColorSensor;
    realtimeChart.update();

    // Update Real-Time Table
    const tableBody = document.querySelector('#real-time-table tbody');
    tableBody.innerHTML = latestData.map((row) => `
        <tr>
            <td>${row.time}</td>
            <td>${row.temp.toFixed(2)}</td>
            <td>${['Off', 'Slow', 'Medium', 'Fast'][row.speed]}</td>
            <td>${row.color}</td>
            <td>${row.heaterStatus}</td>
        </tr>
    `).join('');
}

// Update experiment list in Menu 2
function updateExperimentList() {
    const experimentList = document.getElementById('experimentList');
    experimentList.innerHTML = experiments.map((exp, index) => `
        <div class="experiment">
            <h3>Experiment ${index + 1} - ${exp.startTime}</h3>
            <p>Heater: ${exp.withHeater ? 'On' : 'Off'}</p>
            <table>
                <thead>
                    <tr>
                        <th><i class="fas fa-clock"></i></th>
                        <th><i class="fas fa-thermometer-half"></i> (°C)</th>
                        <th><i class="fas fa-tachometer-alt"></i> (rpm)</th>
                        <th><i class="fas fa-palette"></i></th>
                        <th><i class="fas fa-fire"></i></th>
                    </tr>
                </thead>
                <tbody>
                    ${exp.labels.filter((_, i) => i % 30 === 0).map((label, i) => `
                        <tr>
                            <td>${label}</td>
                            <td>${exp.temperature.filter((_, j) => j % 30 === 0)[i].toFixed(2)}</td>
                            <td>${['Off', 'Slow', 'Medium', 'Fast'][exp.stirrerSpeed.filter((_, j) => j % 30 === 0)[i]]}</td>
                            <td>${exp.colorSensor.filter((_, j) => j % 30 === 0)[i]}</td>
                            <td>${exp.heaterStatus.filter((_, j) => j % 30 === 0)[i]}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <canvas id="experimentChart${index}"></canvas>
        </div>
    `).join('');

    // Render charts for each experiment
    experiments.forEach((exp, index) => {
        const ctx = document.getElementById(`experimentChart${index}`).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: exp.labels.filter((_, i) => i % 30 === 0), // Every 30 seconds
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: exp.temperature.filter((_, i) => i % 30 === 0),
                        borderColor: '#3f51b5',
                        fill: false,
                    },
                    {
                        label: 'Color Sensor',
                        data: exp.colorSensor.filter((_, i) => i % 30 === 0),
                        borderColor: '#4caf50',
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Time' } },
                    y: { title: { display: true, text: 'Value' } },
                },
            },
        });
    });
}

//Timer
let timerInterval = null;
let elapsedTime = 0;

function startTimer() {
    const timerElement = document.getElementById('timer');
    timerInterval = setInterval(() => {
        elapsedTime += 1;
        const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsedTime % 60).padStart(2, '0');
        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = 0;
    document.getElementById('timer').textContent = '00:00:00';
}

// Modify startExperiment function to start the timer
function startExperiment(withHeater) {
    // Reset monitoring section
    resetMonitoring();

    // Initialize new experiment
    currentExperiment = {
        startTime: new Date().toLocaleString(),
        withHeater: withHeater,
        data: [],
        labels: [],
        temperature: [],
        stirrerSpeed: [],
        colorSensor: [],
        heaterStatus: [],
    };
    experiments.push(currentExperiment);
    updateExperimentList();

    // Start monitoring (data collection every 1 second)
    monitoringInterval = setInterval(collectData, 1000);

    // Start updates (every 30 seconds)
    updateInterval = setInterval(updateData, 30000);

    // Start the timer
    startTimer();
}

// Modify stopExperiment function to stop the timer
function stopExperiment() {
    if (currentExperiment) {
        // Stop monitoring and updates
        clearInterval(monitoringInterval);
        clearInterval(updateInterval);
        monitoringInterval = null;
        updateInterval = null;

        // Reset monitoring section
        resetMonitoring();

        // Save the current experiment
        currentExperiment = null;
        updateExperimentList();

        // Stop the timer
        stopTimer();
    }
}

// Button Event Listeners
document.getElementById('startWithoutHeaterBtn').addEventListener('click', () => {
    startExperiment(false);
    alert('Starting without heater...');
});

document.getElementById('startWithHeaterBtn').addEventListener('click', () => {
    startExperiment(true);
    alert('Starting with heater...');
});

document.getElementById('stopBtn').addEventListener('click', () => {
    stopExperiment();
    alert('Stopping microcontroller...');
});
