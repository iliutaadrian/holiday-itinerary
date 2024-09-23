document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('slider');
    const daySelector = document.getElementById('day-selector');
    const notesTextarea = document.getElementById('notes'); // Updated ID
    const saveNotesBtn = document.getElementById('save-notes');
    const loadingSpinner = document.getElementById('loading-spinner');
    const messageDiv = document.getElementById('message');
    let currentDay = 1;

    // Function to fetch the itinerary content from itinerary.md
    function fetchItineraryContent() {
        fetch('/itinerary.md')
            .then(response => response.text())
            .then(content => {
                processMarkdown(content);
            })
            .catch(error => {
                console.error('Error fetching itinerary content:', error);
            });
    }

    // Call the function to fetch and process the itinerary content
    fetchItineraryContent();

    function processMarkdown(content) {
        const html = marked(content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const days = tempDiv.querySelectorAll('h2');
        slider.innerHTML = '';
        daySelector.innerHTML = '';

        days.forEach((day, index) => {
            const dayContent = document.createElement('section');
            dayContent.className = 'day-content';
            dayContent.innerHTML = day.outerHTML;

            let nextElement = day.nextElementSibling;
            while (nextElement && nextElement.tagName !== 'H2') {
                dayContent.innerHTML += nextElement.outerHTML;
                nextElement = nextElement.nextElementSibling;
            }

            slider.appendChild(dayContent);

            const dayButton = document.createElement('button');
            dayButton.className = 'day-btn';
            dayButton.textContent = `Day ${index + 1}`;
            dayButton.dataset.day = index + 1;
            dayButton.addEventListener('click', () => {
                showDay(index + 1);
                // Update URL with day parameter
                history.pushState(null, '', `?day=${index + 1}`);
            });
            daySelector.appendChild(dayButton);
        });

        // Check for day parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const dayParam = urlParams.get('day');
        if (dayParam) {
            showDay(parseInt(dayParam));
        } else {
            showDay(1);
        }
        loadNotes();
    }

    function showDay(day) {
        const dayContents = document.querySelectorAll('.day-content');
        dayContents.forEach((content, index) => {
            content.style.display = index + 1 === day ? 'block' : 'none';
        });
        currentDay = day;
        updateActiveButton();
        displayNotes(day);
    }

    function updateActiveButton() {
        const dayButtons = document.querySelectorAll('.day-btn');
        dayButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.day) === currentDay) {
                btn.classList.add('active');
            }
        });
    }

    // Touch events for mobile swiping
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    slider.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const dayButtons = document.querySelectorAll('.day-btn');
        if (touchEndX < touchStartX && currentDay < dayButtons.length) {
            showDay(currentDay + 1);
        }
        if (touchEndX > touchStartX && currentDay > 1) {
            showDay(currentDay - 1);
        }
    }

    // Note-saving functionality
    saveNotesBtn.addEventListener('click', saveNotes);

    function saveNotes() {
        const notes = notesTextarea.value.trim();
        showLoading(true);
        fetch('/save_note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ day: currentDay, content: notes })
        })
            .then(response => response.json())
            .then(data => {
                showLoading(false);
                if (data.status === 'success') {
                    showMessage('Notes saved successfully', 'success');
                } else {
                    showMessage('Error saving notes', 'error');
                }
            })
            .catch(error => {
                showLoading(false);
                showMessage('Error saving notes: ' + error.message, 'error');
            });
    }

    function loadNotes() {
        displayNotes(currentDay);
    }

    function displayNotes(day) {
        fetch(`/get_note/${day}`)
            .then(response => response.json())
            .then(data => {
                notesTextarea.value = data.content;
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
            });
    }

    function showLoading(isLoading) {
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';
        saveNotesBtn.disabled = isLoading;
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
});
