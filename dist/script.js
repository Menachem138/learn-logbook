let segments = [];
let activeModal = null;
let autoScroll = true;
let isPlaying = false;
const audioPlayer = document.getElementById('audio-player');
const syncIndicator = document.getElementById('sync-indicator');

let playAttempts = 0;
const MAX_PLAY_ATTEMPTS = 3;
let playbackLocked = false;

audioPlayer.addEventListener('play', async () => {
    if (playbackLocked) return;
    playbackLocked = true;
    
    try {
        await audioPlayer.play();
        isPlaying = true;
        playAttempts = 0;
        console.log('Audio started playing successfully');
    } catch (error) {
        console.error('Play error:', error);
        if (playAttempts < MAX_PLAY_ATTEMPTS) {
            playAttempts++;
            setTimeout(() => {
                playbackLocked = false;
                audioPlayer.play().catch(console.error);
            }, 1000);
        }
    } finally {
        playbackLocked = false;
    }
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playbackLocked = false;
    console.log('Audio paused');
});

function retryPlay() {
    if (playAttempts < MAX_PLAY_ATTEMPTS) {
        playAttempts++;
        console.log(`Retry attempt ${playAttempts}/${MAX_PLAY_ATTEMPTS}`);
        setTimeout(() => {
            audioPlayer.play().catch(error => {
                console.error('Play attempt failed:', error);
                retryPlay();
            });
        }, 1000);
    } else {
        console.error('Max play attempts reached');
        syncIndicator.textContent = 'Erreur de lecture';
        syncIndicator.style.color = '#e74c3c';
    }
}

audioPlayer.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    retryPlay();
});

async function loadSegments() {
    try {
        const savedSegments = localStorage.getItem('edited_segments');
        let loadedSegments;
        
        if (savedSegments) {
            try {
                loadedSegments = JSON.parse(savedSegments);
                console.log('Loaded from localStorage:', loadedSegments);
            } catch (e) {
                console.error('Error parsing localStorage:', e);
                localStorage.removeItem('edited_segments');
            }
        }
        
        if (!loadedSegments) {
            try {
                const response = await fetch('translated_segments.json');
                if (!response.ok) throw new Error('Failed to fetch segments');
                loadedSegments = await response.json();
                console.log('Loaded from file:', loadedSegments);
            } catch (fetchError) {
                console.error('Error fetching segments:', fetchError);
                throw new Error('Could not load segments from file');
            }
        }
        
        if (!Array.isArray(loadedSegments) || !loadedSegments.length) {
            throw new Error('Invalid or empty segments data');
        }
        
        segments = loadedSegments.map((segment, index) => {
            const start = Number(segment.start);
            const end = Number(segment.end);
            
            if (isNaN(start) || isNaN(end) || start >= end) {
                console.error(`Invalid timing for segment ${index}:`, segment);
                return {
                    start: index * 5,
                    end: (index + 1) * 5,
                    hebrew: segment.hebrew || '',
                    french: segment.french || ''
                };
            }
            
            return {
                start,
                end,
                hebrew: segment.hebrew || '',
                french: segment.french || ''
            };
        });
        
        updateDisplay();
        syncIndicator.textContent = 'Segments chargés';
        syncIndicator.style.color = '#27ae60';
        console.log('Segments loaded successfully:', segments.length);
    } catch (error) {
        console.error('Error loading segments:', error);
        syncIndicator.textContent = 'Erreur de chargement';
        syncIndicator.style.color = '#e74c3c';
        segments = [];
    }
}

function updateDisplay() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    segments.forEach((segment, index) => {
        const div = document.createElement('div');
        div.className = 'segment';
        div.dataset.index = index;
        div.dataset.start = segment.start;
        div.dataset.end = segment.end;
        
        const button = document.createElement('button');
        button.className = 'edit-button';
        button.textContent = 'Éditer';
        button.onclick = () => createEditModal(segment, index);
        
        const hebrew = document.createElement('p');
        hebrew.className = 'hebrew';
        hebrew.textContent = segment.hebrew;
        hebrew.dir = 'rtl';
        
        const french = document.createElement('p');
        french.className = 'french';
        french.textContent = segment.french;
        
        const timing = document.createElement('small');
        timing.className = 'timing';
        const startTime = Number(segment.start).toFixed(1);
        const endTime = Number(segment.end).toFixed(1);
        timing.textContent = `${startTime}s - ${endTime}s`;
        
        div.appendChild(button);
        div.appendChild(hebrew);
        div.appendChild(french);
        div.appendChild(timing);
        content.appendChild(div);
    });
}

function createEditModal(segment, index) {
    if (activeModal) activeModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="edit-form">
                <label>Texte hébreu:</label>
                <textarea dir="rtl">${segment.hebrew}</textarea>
                <label>Traduction française:</label>
                <textarea>${segment.french}</textarea>
                <div class="button-group">
                    <button onclick="saveEdit(${index})">Sauvegarder</button>
                    <button onclick="closeModal()">Annuler</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
}

function saveEdit(index) {
    const modal = activeModal;
    if (!modal) return;
    
    try {
        const [hebrewInput, frenchInput] = modal.querySelectorAll('textarea');
        const originalSegment = segments[index];
        const updatedSegment = {
            start: originalSegment.start,
            end: originalSegment.end,
            hebrew: hebrewInput.value,
            french: frenchInput.value
        };
        
        segments[index] = updatedSegment;
        localStorage.setItem('edited_segments', JSON.stringify(segments));
        console.log('Segment saved:', updatedSegment);
        
        const feedback = document.createElement('div');
        feedback.textContent = 'Modifications enregistrées';
        feedback.style.cssText = 'position:fixed;top:20px;right:20px;background:#27ae60;color:white;padding:10px;border-radius:4px;z-index:9999;';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
        
        updateDisplay();
        closeModal();
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
}

function closeModal() {
    if (activeModal) {
        activeModal.remove();
        activeModal = null;
    }
}

audioPlayer.addEventListener('loadstart', () => {
    console.log('Audio loading started');
    syncIndicator.textContent = 'Chargement...';
});

audioPlayer.addEventListener('loadeddata', () => {
    console.log('Audio data loaded');
    syncIndicator.textContent = 'Audio chargé';
});

audioPlayer.addEventListener('canplay', () => {
    console.log('Audio can play');
    syncIndicator.textContent = 'Prêt';
    syncIndicator.style.color = '#27ae60';
});

audioPlayer.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    const error = audioPlayer.error;
    console.error('Error details:', {
        code: error.code,
        message: error.message
    });
    syncIndicator.textContent = 'Erreur de chargement audio';
    syncIndicator.style.color = '#e74c3c';
    document.querySelector('.audio-error').textContent = 'Erreur: Impossible de lire le fichier audio';
    document.querySelector('.audio-error').style.display = 'block';
});

audioPlayer.addEventListener('timeupdate', () => {
    if (!isPlaying) return;
    
    const currentTime = audioPlayer.currentTime;
    const currentSegment = segments.find(segment => 
        currentTime >= segment.start && currentTime < segment.end
    );
    
    if (currentSegment) {
        const segmentIndex = segments.indexOf(currentSegment);
        document.querySelectorAll('.segment').forEach(div => {
            div.classList.remove('active');
            if (div.dataset.index === segmentIndex.toString()) {
                div.classList.add('active');
                if (autoScroll) {
                    div.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center'
                    });
                }
            }
        });
        syncIndicator.textContent = 'Lecture en cours';
        syncIndicator.style.color = '#27ae60';
    }
});

document.getElementById('toggle-scroll').addEventListener('click', (e) => {
    autoScroll = !autoScroll;
    e.target.textContent = `Défilement automatique: ${autoScroll ? 'Activé' : 'Désactivé'}`;
});

loadSegments();
