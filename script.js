document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('slider');
    const daySelector = document.getElementById('day-selector');
    const notesTextarea = document.getElementById('notes'); // Updated ID
    const saveNotesBtn = document.getElementById('save-notes');
    let currentDay = 1;

    // Function to fetch the itinerary content from itinerary.md
    function fetchItineraryContent() {
        fetch('itinerary.md')
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
            dayButton.addEventListener('click', () => showDay(index + 1));
            daySelector.appendChild(dayButton);
        });

        showDay(1);
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
        const allNotes = JSON.parse(localStorage.getItem('itineraryNotes')) || {};
        allNotes[currentDay] = notes;
        localStorage.setItem('itineraryNotes', JSON.stringify(allNotes));
    }

    function loadNotes() {
        const allNotes = JSON.parse(localStorage.getItem('itineraryNotes')) || {};
        displayNotes(currentDay);
    }

    function displayNotes(day) {
        const allNotes = JSON.parse(localStorage.getItem('itineraryNotes')) || {};
        const dayNotes = allNotes[day] || '';
        notesTextarea.value = dayNotes;
    }
});
