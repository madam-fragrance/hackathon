
// Month data mapping
const monthFiles = {
    'month1.json.json',
    'month2.json.json',
    'month3.json.json',
    'month4.json.json',
    'month5.json.json',
    'month6.json.json',
    'month-7.json.json',
    'month8.json.',
};

// Store the full month data
let currentMonthData = [];

// Load initial month on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initially hide week selector
    document.getElementById('weekSelector').style.display = 'none';
    document.getElementById('weekLabel').style.display = 'none';
});

function loadWeeks() {
    const monthSelector = document.getElementById('monthSelector');
    const weekSelector = document.getElementById('weekSelector');
    const weekLabel = document.getElementById('weekLabel');
    const selectedMonth = monthSelector.value;

    if (!selectedMonth) {
        weekSelector.style.display = 'none';
        weekLabel.style.display = 'none';
        document.getElementById('chat').innerHTML = '';
        return;
    }

    const selectedFile = monthFiles[selectedMonth];

    fetch(selectedFile)
        .then(response => response.json())
        .then(data => {
            currentMonthData = data;
            
            // Extract weeks from the data
            const weeks = extractWeeks(data);
            
            // Populate week selector
            weekSelector.innerHTML = '<option value="">All weeks</option>';
            weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = week.id;
                option.textContent = week.title;
                weekSelector.appendChild(option);
            });
            
            // Show week selector
            weekSelector.style.display = 'inline-block';
            weekLabel.style.display = 'inline-block';
            
            // Display all month data initially
            displayChat(data);
        })
        .catch(error => {
            console.error('Error loading chat data:', error);
            document.getElementById('chat').innerHTML = '<p>Error loading chat data</p>';
        });
}

function extractWeeks(data) {
    const weeks = [];
    let currentWeekId = 0;
    
    data.forEach((item, index) => {
        const key = Object.keys(item)[0];
        const value = item[key];
        
        // Check if this is a week header
        if (value.startsWith('Week ') && value.includes(':')) {
            weeks.push({
                id: currentWeekId++,
                title: value,
                startIndex: index
            });
        }
    });
    
    // Add end index for each week
    for (let i = 0; i < weeks.length; i++) {
        if (i < weeks.length - 1) {
            weeks[i].endIndex = weeks[i + 1].startIndex - 1;
        } else {
            weeks[i].endIndex = data.length - 1;
        }
    }
    
    return weeks;
}

function loadWeekChat() {
    const weekSelector = document.getElementById('weekSelector');
    const selectedWeek = weekSelector.value;
    
    if (selectedWeek === '') {
        // Show all weeks
        displayChat(currentMonthData);
        return;
    }
    
    // Filter data for selected week
    const weeks = extractWeeks(currentMonthData);
    const week = weeks[parseInt(selectedWeek)];
    
    if (week) {
        const weekData = currentMonthData.slice(week.startIndex, week.endIndex + 1);
        displayChat(weekData);
    }
}

function displayChat(data) {
    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML = '';

    data.forEach(item => {
        const key = Object.keys(item)[0];
        const value = item[key];

        // Check if this is a section header (Week X:)
        if (value.startsWith('Week ') && value.includes(':')) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'section-header';
            headerDiv.textContent = value;
            chatDiv.appendChild(headerDiv);
        }
        // Check if this is a summary item (starts with -)
        else if (value.startsWith('- ') || value.startsWith('Based on') || value.includes('Summary') || value.includes('Metrics') || value.includes('Focus') || value.includes('Notes:')) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'summary-item';
            summaryDiv.textContent = value;
            chatDiv.appendChild(summaryDiv);
        }
        // Check if this is a timestamped message
        else if (value.match(/^\[[\d-]+ [\d:]+\]/)) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';

            // Extract sender and message
            const match = value.match(/^\[([\d-]+ [\d:]+)\] ([^:]+): (.+)$/);
            if (match) {
                const [, timestamp, sender, messageText] = match;

                // Determine if it's a team member or the client
                const isTeamMember = ['Ruby', 'Dr. Warren', 'Advik', 'Carla', 'Rachel', 'Neel'].includes(sender);
                messageDiv.className += isTeamMember ? ' team' : ' member';

                messageDiv.innerHTML = `
                    <div class="sender">${sender}</div>
                    <div class="timestamp">${timestamp}</div>
                    <div>${messageText}</div>
                `;
            } else {
                messageDiv.innerHTML = value;
            }

            chatDiv.appendChild(messageDiv);
        }
        // Handle other content (like summaries, headers, etc.)
        else {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'summary-item';
            contentDiv.textContent = value;
            chatDiv.appendChild(contentDiv);
        }
    });
}
