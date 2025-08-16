const monthFiles = {
  month1: 'assets/month1.json',
  month2: 'assets/month2.json',
  month3: 'assets/month3.json',
  month4: 'assets/month4.json',
  month5: 'assets/month5.json',
  month6: 'assets/month6.json',
  month7: 'assets/month7.json',
  month8: 'assets/month8.json',
};

let currentMonthData = [];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('weekSelector').style.display = 'none';
  document.getElementById('weekLabel').style.display = 'none';

  document.getElementById('monthSelector').addEventListener('change', loadWeeks);
  document.getElementById('weekSelector').addEventListener('change', loadWeekChat);
});

// Load week options after month selection
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
      const weeks = extractWeeks(data);

      weekSelector.innerHTML = '<option value="">--All Weeks--</option>';
      weeks.forEach((week, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = week.title;
        weekSelector.appendChild(option);
      });

      // Display Week selector if weeks found
      if (weeks.length > 0) {
        weekSelector.style.display = 'inline-block';
        weekLabel.style.display = 'inline-block';
      } else {
        weekSelector.style.display = 'none';
        weekLabel.style.display = 'none';
      }

      displayChat(data);
    })
    .catch(error => {
      document.getElementById('chat').innerHTML = '<div class="summary-item">Error loading chat data!</div>';
    });
}

// Extract week headers for week selector
function extractWeeks(data) {
  const weeks = [];
  data.forEach((item, index) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    if (typeof value === 'string' && value.startsWith('Week ') && value.includes(':')) {
      weeks.push({ title: value, startIndex: index });
    }
  });
  // Assign endIndex to each week
  for (let i = 0; i < weeks.length; i++) {
    weeks[i].endIndex = (i < weeks.length - 1) ? weeks[i + 1].startIndex - 1 : data.length - 1;
  }
  return weeks;
}

// Load only the selected week's messages
function loadWeekChat() {
  const weekSelector = document.getElementById('weekSelector');
  const selectedWeek = weekSelector.value;
  if (selectedWeek === "") {
    displayChat(currentMonthData);
    return;
  }
  const weeks = extractWeeks(currentMonthData);
  const week = weeks[parseInt(selectedWeek)];
  if (week) {
    const weekData = currentMonthData.slice(week.startIndex, week.endIndex + 1);
    displayChat(weekData);
  }
}

// Display chat messages in WhatsApp style
function displayChat(data) {
  const chatDiv = document.getElementById('chat');
  chatDiv.innerHTML = '';
  data.forEach(item => {
    const key = Object.keys(item)[0];
    const value = item[key];

    // Section Header
    if (typeof value === 'string' && value.startsWith('Week ') && value.includes(':')) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'section-header';
      headerDiv.textContent = value;
      chatDiv.appendChild(headerDiv);
    }
    // Summary style: summary list or focus
    else if (
      typeof value === 'string' && (
        value.startsWith('- ') ||
        value.startsWith('Based on') ||
        value.toUpperCase().includes('SUMMARY') ||
        value.toUpperCase().includes('METRICS') ||
        value.toUpperCase().includes('FOCUS') ||
        value.toUpperCase().includes('NOTES') ||
        value.toUpperCase().includes('ACHIEVEMENT') ||
        value.toUpperCase().includes('PERIOD')
      )
    ) {
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'summary-item';
      summaryDiv.textContent = value;
      chatDiv.appendChild(summaryDiv);
    }
    // Main message
    else if (typeof value === 'string' && value.match(/^\[[\d-]+ [\d:]+\]/)) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message';

      const match = value.match(/^\[([\d-]+ [\d:]+)\] ([^:]+): (.+)$/);
      if (match) {
        const [, timestamp, sender, messageText] = match;
        const teamNames = ['Ruby', 'Dr. Warren', 'Advik', 'Carla', 'Rachel', 'Neel'];
        msgDiv.className += teamNames.includes(sender) ? ' team' : ' member';

        msgDiv.innerHTML = `
          <span class="sender">${sender}</span>
          <span>${messageText}</span>
          <span class="timestamp">${timestamp}</span>
        `;
        chatDiv.appendChild(msgDiv);
      }
      // Fallback: unknown format
      else {
        msgDiv.className += ' team';
        msgDiv.textContent = value;
        chatDiv.appendChild(msgDiv);
      }
    }
    // Generic text, render as summary
    else if (typeof value === 'string' && value.trim().length > 0) {
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'summary-item';
      summaryDiv.textContent = value;
      chatDiv.appendChild(summaryDiv);
    }
  });
}