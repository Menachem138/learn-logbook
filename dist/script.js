document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing audio sync and edit functionality...');
    let segments = [];
    let autoScroll = true;
    let wasPlaying = false;
    const audioPlayer = document.getElementById('audio-player');
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Cours de Torah',
            artist: 'Rabbi Abichid',
            album: 'Cours sur les lois du deuil',
            artwork: [
                { src: 'assets/torah-icon.svg', sizes: '512x512', type: 'image/svg+xml' },
                { src: 'assets/icons/torah-icon-96.png', sizes: '96x96', type: 'image/png' },
                { src: 'assets/icons/torah-icon-128.png', sizes: '128x128', type: 'image/png' },
                { src: 'assets/icons/torah-icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'assets/icons/torah-icon-256.png', sizes: '256x256', type: 'image/png' },
                { src: 'assets/icons/torah-icon-384.png', sizes: '384x384', type: 'image/png' },
                { src: 'assets/icons/torah-icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
        });
        
        navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
        });
    }
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio player error:', e);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Erreur de lecture audio. Veuillez réessayer.';
        document.body.insertBefore(errorMessage, document.body.firstChild);
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime;
        const syncIndicator = document.getElementById('sync-indicator');
        const currentSegment = segments.find(segment => 
            currentTime >= segment.start && currentTime < segment.end
        );
        
        if (currentSegment) {
            syncIndicator.textContent = 'Synchronisé';
            syncIndicator.style.color = '#27ae60';
        } else {
            syncIndicator.textContent = 'Recherche...';
            syncIndicator.style.color = '#e67e22';
        }
        
        if (currentSegment) {
            const segmentIndex = segments.indexOf(currentSegment);
            highlightSegment(segmentIndex);
            
            if (autoScroll) {
                const activeDiv = document.querySelector(`.segment[data-index="${segmentIndex}"]`);
                if (activeDiv) {
                    activeDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    });
    
    function highlightSegment(index) {
        document.querySelectorAll('.segment').forEach(div => {
            div.classList.remove('active');
        });
        const activeDiv = document.querySelector(`.segment[data-index="${index}"]`);
        if (activeDiv) {
            activeDiv.classList.add('active');
        }
    }
    
    document.getElementById('toggle-scroll').addEventListener('click', (e) => {
        autoScroll = !autoScroll;
        e.target.textContent = `Défilement automatique: ${autoScroll ? 'Activé' : 'Désactivé'}`;
    });
    
    function updateDisplay() {
        const content = document.getElementById('text-content');
        content.innerHTML = '';
        segments.forEach((segment, index) => {
            const div = document.createElement('div');
            div.className = 'segment';
            div.dataset.index = index;
            
            const button = document.createElement('button');
            button.className = 'edit-button';
            button.textContent = 'Éditer';
            button.onclick = () => openEditModal(index);
            
            const hebrew = document.createElement('p');
            hebrew.className = 'hebrew';
            hebrew.textContent = segment.hebrew;
            
            const french = document.createElement('p');
            french.className = 'french';
            french.textContent = segment.french;
            
            div.appendChild(button);
            div.appendChild(hebrew);
            div.appendChild(french);
            content.appendChild(div);
        });
    }
    
    let activeModal = null;

    function openEditModal(index) {
        console.log('Opening edit modal for segment', index);
        const segment = segments[index];
        if (!segment) {
            console.error('Segment not found at index:', index);
            return;
        }
        
        wasPlaying = !audioPlayer.paused;
        if (wasPlaying) {
            audioPlayer.pause();
        }
        
        // Remove any existing modal
        if (activeModal) {
            activeModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        activeModal = modal;
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const title = document.createElement('h3');
        title.textContent = 'Éditer le segment';
        content.appendChild(title);
        
        const form = document.createElement('div');
        form.className = 'edit-form';
        
        const hebrewLabel = document.createElement('label');
        hebrewLabel.textContent = 'Texte hébreu:';
        const hebrewInput = document.createElement('textarea');
        hebrewInput.id = 'hebrew-edit';
        hebrewInput.dir = 'rtl';
        hebrewInput.value = segment.hebrew || '';
        
        const frenchLabel = document.createElement('label');
        frenchLabel.textContent = 'Traduction française:';
        const frenchInput = document.createElement('textarea');
        frenchInput.id = 'french-edit';
        frenchInput.value = segment.french || '';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'save-edit';
        saveBtn.textContent = 'Sauvegarder';
        saveBtn.onclick = () => {
            try {
                segments[index].hebrew = hebrewInput.value;
                segments[index].french = frenchInput.value;
                localStorage.setItem('edited_segments', JSON.stringify(segments));
                console.log('Saved changes for segment', index);
                
                const feedback = document.createElement('div');
                feedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #27ae60;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 9999;
                    transition: opacity 0.5s ease;
                `;
                feedback.textContent = 'Modifications enregistrées !';
                document.body.appendChild(feedback);
                
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    setTimeout(() => feedback.remove(), 500);
                }, 2000);
                
                updateDisplay();
                modal.remove();
                activeModal = null;
                if (wasPlaying) {
                    audioPlayer.play().catch(error => {
                        console.error('Error resuming playback:', error);
                    });
                }
            } catch (error) {
                console.error('Error saving changes:', error);
                const errorFeedback = document.createElement('div');
                errorFeedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #e74c3c;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 9999;
                    transition: opacity 0.5s ease;
                `;
                errorFeedback.textContent = 'Erreur lors de la sauvegarde';
                document.body.appendChild(errorFeedback);
                
                setTimeout(() => {
                    errorFeedback.style.opacity = '0';
                    setTimeout(() => errorFeedback.remove(), 500);
                }, 2000);
            }
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit';
        cancelBtn.textContent = 'Annuler';
        cancelBtn.onclick = () => {
            console.log('Cancelled edit for segment', index);
            modal.remove();
            activeModal = null;
            if (wasPlaying) {
                audioPlayer.play().catch(error => {
                    console.error('Error resuming playback:', error);
                });
            }
        };
        
        form.appendChild(hebrewLabel);
        form.appendChild(hebrewInput);
        form.appendChild(frenchLabel);
        form.appendChild(frenchInput);
        buttonGroup.appendChild(saveBtn);
        buttonGroup.appendChild(cancelBtn);
        form.appendChild(buttonGroup);
        
        content.appendChild(form);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    // Removed duplicate updateDisplay function
    
    console.log('Loading segments...');
    const savedSegments = localStorage.getItem('edited_segments');
    if (savedSegments) {
        try {
            segments = JSON.parse(savedSegments);
            console.log('Loaded segments from localStorage:', segments.length);
            updateDisplay();
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            localStorage.removeItem('edited_segments');
            loadFromServer();
        }
    } else {
        loadFromServer();
    }
    
    function loadFromServer() {
        console.log('Loading segments from server...');
        fetch('api/translated_segments.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                segments = data;
                console.log('Loaded segments from server:', segments.length);
                localStorage.setItem('cached_segments', JSON.stringify(data));
                localStorage.setItem('last_cache_update', new Date().toISOString());
                updateDisplay();
            })
            .catch(error => {
                console.error('Error loading from server:', error);
                const cachedData = localStorage.getItem('cached_segments');
                if (cachedData) {
                    console.log('Using cached data due to network error');
                    segments = JSON.parse(cachedData);
                    updateDisplay();
                    
                    const lastUpdate = localStorage.getItem('last_cache_update');
                    if (lastUpdate) {
                        const statusDisplay = document.querySelector('.status-display');
                        if (statusDisplay) {
                            const lastUpdateSpan = document.getElementById('last-update');
                            if (lastUpdateSpan) {
                                lastUpdateSpan.textContent = new Date(lastUpdate).toLocaleString('fr-FR');
                            }
                        }
                    }
                }
            });
    }
});
