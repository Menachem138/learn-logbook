document.addEventListener('DOMContentLoaded', () => {
    let textContent = [];
    let lastActiveIndex = -1;
    const audioPlayer = document.getElementById('audio-player');
    let autoScroll = true;
    let autoRefresh = true;
    const toggleScrollButton = document.getElementById('toggle-scroll');
    const refreshInterval = 30000;
    const statusContainer = document.getElementById('status-container');
    
    // Gestion avancée des erreurs de chargement audio
    let audioRetryCount = 0;
    const MAX_AUDIO_RETRIES = 3;
    const AUDIO_RETRY_DELAY = 3000;
    
    audioPlayer.addEventListener('error', async (e) => {
        const errorMessages = {
            MEDIA_ERR_ABORTED: 'La lecture a été interrompue',
            MEDIA_ERR_NETWORK: 'Une erreur réseau est survenue',
            MEDIA_ERR_DECODE: 'Le fichier audio est corrompu',
            MEDIA_ERR_SRC_NOT_SUPPORTED: 'Le format audio n\'est pas supporté'
        };
        
        const error = e.target.error;
        const errorMessage = errorMessages[Object.keys(MediaError.prototype)
            .find(key => MediaError.prototype[key] === error.code)] || 'Erreur inconnue';
        
        console.error(`Erreur audio (${audioRetryCount + 1}/${MAX_AUDIO_RETRIES}):`, errorMessage);
        
        if (audioRetryCount < MAX_AUDIO_RETRIES) {
            audioRetryCount++;
            statusContainer.innerHTML = 
                `<div class="loading">Tentative de reprise audio ${audioRetryCount}/${MAX_AUDIO_RETRIES}...</div>`;
            
            // Sauvegarder la position actuelle
            const currentTime = audioPlayer.currentTime;
            
            try {
                await new Promise(resolve => setTimeout(resolve, AUDIO_RETRY_DELAY));
                audioPlayer.load();
                await audioPlayer.play();
                audioPlayer.currentTime = currentTime;
                
                // Réinitialiser le compteur si la lecture reprend
                audioRetryCount = 0;
                statusContainer.innerHTML = '<div class="info">Lecture audio reprise</div>';
                setTimeout(() => {
                    if (!appState.hasError) statusContainer.innerHTML = '';
                }, 3000);
            } catch (playError) {
                handleError(new Error(`Erreur audio : ${errorMessage} (tentative ${audioRetryCount})`));
            }
        } else {
            handleError(new Error(`Erreur audio persistante : ${errorMessage}`));
            statusContainer.innerHTML = 
                '<div class="error">Impossible de reprendre la lecture audio. Veuillez rafraîchir la page.</div>';
        }
    });
    
    audioPlayer.addEventListener('canplay', () => {
        if (appState.hasError) {
            updateAppState({ hasError: false, errorMessage: '' });
        }
    });
    
    function startAutoRefresh() {
        return setInterval(() => {
            if (autoRefresh) {
                updateStatus();
                loadNewSegments();
            }
        }, refreshInterval);
    }
    
    async function loadNewSegments(retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 2000;
        
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(baseUrl + 'translated_segments.json', {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.length > textContent.length) {
                console.log(`Nouveaux segments disponibles: ${data.length - textContent.length}`);
                textContent = data;
                displayText(textContent);
                updateStatus();
                cacheSegments(data);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Erreur de chargement:', error);
            
            if (retryCount < MAX_RETRIES) {
                console.log(`Tentative de rechargement (${retryCount + 1}/${MAX_RETRIES})...`);
                statusContainer.innerHTML = `<div class="loading">Tentative de reconnexion ${retryCount + 1}/${MAX_RETRIES}...</div>`;
                
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return loadNewSegments(retryCount + 1);
            }
            
            if (error.name === 'AbortError') {
                handleError(new Error('Le chargement a pris trop de temps'));
            } else {
                handleError(error);
            }
            
            const cachedData = loadFromCache();
            if (cachedData) {
                console.log('Utilisation des données en cache après échec');
                textContent = cachedData;
                displayText(cachedData);
            }
        }
    }
    
    let refreshTimer = startAutoRefresh();
    const timeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    
    function updateStatus() {
        fetch('status.json')
            .then(response => response.json())
            .then(status => {
                const progress = ((status.segments_traduits / status.segments_total) * 100).toFixed(1);
                document.title = `Cours de Torah (${progress}% traduit)`;
                document.getElementById('translation-progress').textContent = progress;
                document.getElementById('segments-count').textContent = status.segments_traduits;
                document.getElementById('total-segments').textContent = status.segments_total;
                document.getElementById('last-update').textContent = status.derniere_mise_a_jour;
                
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                    progressBar.setAttribute('aria-valuenow', progress);
                }
            })
            .catch(console.error);
    }
    
    // Mettre à jour le statut immédiatement et toutes les 30 secondes
    updateStatus();
    setInterval(updateStatus, 30000);
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    toggleScrollButton.addEventListener('click', () => {
        autoScroll = !autoScroll;
        toggleScrollButton.textContent = `Défilement automatique: ${autoScroll ? 'Activé' : 'Désactivé'}`;
        toggleScrollButton.classList.toggle('disabled', !autoScroll);
    });
    
    const toggleRefreshButton = document.getElementById('toggle-refresh');
    toggleRefreshButton.addEventListener('click', () => {
        autoRefresh = !autoRefresh;
        toggleRefreshButton.textContent = `Actualisation: ${autoRefresh ? 'Activée' : 'Désactivée'}`;
        toggleRefreshButton.classList.toggle('disabled', !autoRefresh);
    });
    
    // Gestion du double-tap sur mobile
    let lastTap = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const currentActive = document.querySelector('.segment.active');
        if (!currentActive) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const touchDiff = touchEndY - touchStartY;
        
        if (Math.abs(touchDiff) > 50) {
            // Swipe vertical détecté
            navigateSegments(touchDiff < 0 ? 'down' : 'up');
            return;
        }
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            // Double-tap détecté
            const currentIndex = parseInt(currentActive.id.split('-')[1]);
            audioPlayer.currentTime = textContent[currentIndex].start;
            e.preventDefault();
        }
        lastTap = currentTime;
    });
    
    // États de l'application
    const appState = {
        isLoading: false,
        hasError: false,
        errorMessage: '',
        lastLoadedSegment: null
    };

    function updateAppState(newState) {
        Object.assign(appState, newState);
        
        if (appState.isLoading) {
            statusContainer.innerHTML = '<div class="loading">Chargement en cours...</div>';
        } else if (appState.hasError) {
            statusContainer.innerHTML = `<div class="error">Erreur : ${appState.errorMessage}</div>`;
        } else {
            statusContainer.innerHTML = '';
        }
    }

    function handleError(error) {
        console.error('Erreur :', error);
        
        let errorMessage;
        let shouldUseCache = false;
        let shouldRetry = false;
        let shouldReconnect = false;
        
        if (error.name === 'AbortError') {
            errorMessage = 'Le chargement a pris trop de temps. Tentative de reconnexion...';
            shouldReconnect = true;
        } else if (error.message.includes('HTTP')) {
            errorMessage = 'Erreur de connexion au serveur. Utilisation du cache...';
            shouldUseCache = true;
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erreur de format des données. Rechargement...';
            shouldRetry = true;
        } else if (error.message.includes('perdue') || !navigator.onLine) {
            errorMessage = 'Connexion perdue. Utilisation du cache...';
            shouldUseCache = true;
        } else if (error.message.includes('synchronisation')) {
            errorMessage = 'Désynchronisation audio/texte. Tentative de récupération...';
            shouldRetry = true;
        } else if (error.message.includes('segment')) {
            errorMessage = 'Segment manquant ou corrompu. Tentative de récupération...';
            shouldUseCache = true;
            shouldRetry = true;
        } else {
            errorMessage = 'Une erreur est survenue. Tentative de récupération...';
            shouldUseCache = true;
        }
        
        updateAppState({
            isLoading: false,
            hasError: true,
            errorMessage: errorMessage
        });
        
        if (shouldUseCache) {
            const cachedData = loadFromCache();
            if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                console.log('Utilisation des données en cache');
                textContent = cachedData;
                displayText(cachedData);
            }
        }
        
        if (shouldRetry) {
            setTimeout(() => {
                console.log('Tentative de rechargement...');
                loadNewSegments();
            }, 3000);
        }
        
        if (shouldReconnect) {
            setTimeout(() => {
                console.log('Tentative de reconnexion...');
                initializeContent();
            }, 5000);
        }
        
        if (!navigator.onLine) {
            const cachedData = loadFromCache();
            if (cachedData) {
                console.log('Utilisation des données en cache pendant la déconnexion');
                textContent = cachedData;
                displayText(cachedData);
                const statusContainer = document.getElementById('status-container');
                statusContainer.innerHTML += '<div class="info">Mode hors-ligne actif</div>';
            }
        }
        
        // Tentative de récupération de la position
        if (appState.lastLoadedSegment) {
            setTimeout(() => {
                audioPlayer.currentTime = (appState.lastLoadedSegment.start / 2659.08) * audioPlayer.duration;
            }, 1000);
        }
        
        // Planifier une tentative de rechargement
        if (navigator.onLine) {
            setTimeout(() => {
                console.log('Tentative de rechargement automatique...');
                initializeContent();
            }, 5000);
        }
    }

    // Gestion de la mémoire et des performances
    const SEGMENT_BATCH_SIZE = 50; // Nombre de segments à afficher à la fois
    let visibleSegmentRange = {
        start: 0,
        end: SEGMENT_BATCH_SIZE
    };
    
    function cleanupSegments() {
        const container = document.getElementById('text-content');
        while (container.children.length > SEGMENT_BATCH_SIZE * 2) {
            container.removeChild(container.firstChild);
        }
    }
    
    function displayText(segments) {
        if (!segments || !Array.isArray(segments)) {
            console.error('Segments invalides');
            handleError(new Error('Format de segments invalide'));
            return;
        }
        
        if (segments.length === 0) {
            console.warn('Aucun segment à afficher');
            return;
        }
        
        updateAppState({ isLoading: true, hasError: false });
        const textContainer = document.getElementById('text-content');
        if (!textContainer) {
            console.error('Conteneur de texte non trouvé');
            return;
        }
        textContainer.innerHTML = '';
        
        if (textContainer.children.length > SEGMENT_BATCH_SIZE * 2) {
            cleanupSegments();
        }
        
        let currentSection = '';
        
        const sectionPatterns = [
            { id: 'section-1', pattern: /^א\.\s/, title: "א. Règles fondamentales", hebrew: "א. יסודות ההלכה" },
            { id: 'section-2', pattern: /^ב\.\s/, title: "ב. Développement des lois", hebrew: "ב. פיתוח ההלכות" },
            { id: 'section-3', pattern: /^ג\.\s/, title: "ג. Applications pratiques", hebrew: "ג. יישומים מעשיים" },
            { id: 'section-4', pattern: /^ד\.\s/, title: "ד. Cas particuliers", hebrew: "ד. מקרים מיוחדים" },
            { id: 'section-5', pattern: /^ה\.\s/, title: "ה. Résumé et conclusions", hebrew: "ה. סיכום ומסקנות" },
            { id: 'section-6', pattern: /^ו\.\s/, title: "ו. Points importants", hebrew: "ו. נקודות חשובות" }
        ];
        
        const sourcePatterns = [
            { pattern: /שולחן ערוך/, source: "Shoulhan Aroukh" },
            { pattern: /גמרא/, source: "Guemara" },
            { pattern: /רמב\"ם/, source: "Rambam" },
            { pattern: /משנה ברורה/, source: "Mishna Beroura" },
            { pattern: /בית יוסף/, source: "Beit Yossef" }
        ];
            
        const torahTerms = {
            // Termes de base
            'תורה': 'תּוֹרָה',
            'מצוה': 'מִצְוָה',
            'הלכה': 'הֲלָכָה',
            'תפילה': 'תְּפִלָּה',
            'ברכה': 'בְּרָכָה',
            'שבת': 'שַׁבָּת',
            
            // Termes liés au deuil
            'אבל': 'אָבֵל',
            'שבעה': 'שִׁבְעָה',
            'אבלות': 'אֲבֵלוּת',
            'קבורה': 'קְבוּרָה',
            'הספד': 'הֶסְפֵּד',
            'נפטר': 'נִפְטָר',
            'מת': 'מֵת',
            'קריעה': 'קְרִיעָה',
            'אנינות': 'אֲנִינוּת',
            'הלוויה': 'הַלְוָיָה',
            'ניחום': 'נִיחוּם',
            'אבלים': 'אֲבֵלִים',
            'מנחם': 'מְנַחֵם',
            'קדיש': 'קַדִּישׁ',
            'יארצייט': 'יָארְצַייט',
            'נשמה': 'נְשָׁמָה',
            'עולם הבא': 'עוֹלָם הַבָּא',
            'בית הקברות': 'בֵּית הַקְּבָרוֹת',
            'מצבה': 'מַצֵּבָה',
            'זכר': 'זֵכֶר',
            'לברכה': 'לִבְרָכָה',
            'נר נשמה': 'נֵר נְשָׁמָה',
            'יזכור': 'יִזְכּוֹר',
            
            // Termes rabbiniques
            'גמרא': 'גְּמָרָא',
            'משנה': 'מִשְׁנָה',
            'תלמוד': 'תַּלְמוּד',
            'חכמים': 'חֲכָמִים',
            'רבנים': 'רַבָּנִים',
            'פוסקים': 'פּוֹסְקִים',
            'מנהג': 'מִנְהָג',
            'דין': 'דִּין',
            'הלכה למעשה': 'הֲלָכָה לְמַעֲשֶׂה',
            
            // Lieux et objets
            'בית כנסת': 'בֵּית כְּנֶסֶת',
            'בית מדרש': 'בֵּית מִדְרָשׁ',
            'ספר תורה': 'סֵפֶר תּוֹרָה',
            
            // Actions religieuses
            'מתפלל': 'מִתְפַּלֵּל',
            'לומד': 'לוֹמֵד',
            'מברך': 'מְבָרֵךְ',
            'אומר': 'אוֹמֵר',
            'מתאבל': 'מִתְאַבֵּל',
            'קורע': 'קוֹרֵעַ',
            'מספיד': 'מַסְפִּיד'
        };
        
        segments.forEach((segment, index) => {
            const div = document.createElement('div');
            div.className = 'segment';
            
            let hebrewText = segment.hebrew;
            // Trier les termes par longueur décroissante pour traiter d'abord les termes composés
            const sortedTerms = Object.entries(torahTerms).sort((a, b) => b[0].length - a[0].length);
            
            sortedTerms.forEach(([term, nikud]) => {
                // Échapper les caractères spéciaux pour la regex
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Ajouter des limites de mots pour éviter les remplacements partiels
                const regex = new RegExp(`(^|\\s)(${escapedTerm})(\\s|$)`, 'g');
                const translations = {
                    'תּוֹרָה': 'Torah',
                    'מִצְוָה': 'Mitsva',
                    'הֲלָכָה': 'Halakha',
                    'תְּפִלָּה': 'Prière',
                    'בְּרָכָה': 'Bénédiction',
                    'שַׁבָּת': 'Chabbat',
                    'אָבֵל': 'Endeuillé',
                    'שִׁבְעָה': 'Chiva (7 jours de deuil)',
                    'אֲבֵלוּת': 'Deuil',
                    'קְבוּרָה': 'Enterrement',
                    'הֶסְפֵּד': 'Oraison funèbre',
                    'נִפְטָר': 'Défunt',
                    'מֵת': 'Mort',
                    'קְרִיעָה': 'Déchirure rituelle',
                    'אֲנִינוּת': 'Aninoute (période avant l\'enterrement)',
                    'הַלְוָיָה': 'Levaya (cérémonie funéraire)',
                    'נִיחוּם': 'Réconfort',
                    'אֲבֵלִים': 'Endeuillés',
                    'מְנַחֵם': 'Consolateur',
                    'קַדִּישׁ': 'Kaddich',
                    'יָארְצַייט': 'Yahrzeit (anniversaire du décès)',
                    'נְשָׁמָה': 'Âme',
                    'עוֹלָם הַבָּא': 'Monde futur',
                    'בֵּית הַקְּבָרוֹת': 'Cimetière',
                    'מַצֵּבָה': 'Pierre tombale',
                    'זֵכֶר': 'Souvenir',
                    'לִבְרָכָה': 'de mémoire bénie',
                    'נֵר נְשָׁמָה': 'Bougie commémorative',
                    'יִזְכּוֹר': 'Yizkor (prière du souvenir)',
                    'גְּמָרָא': 'Guemara',
                    'מִשְׁנָה': 'Michna',
                    'תַּלְמוּד': 'Talmud',
                    'חֲכָמִים': 'Sages',
                    'רַבָּנִים': 'Rabbins',
                    'פּוֹסְקִים': 'Décisionnaires',
                    'מִנְהָג': 'Coutume',
                    'דִּין': 'Loi',
                    'הֲלָכָה לְמַעֲשֶׂה': 'Loi pratique',
                    'בֵּית כְּנֶסֶת': 'Synagogue',
                    'בֵּית מִדְרָשׁ': 'Maison d\'étude',
                    'סֵפֶר תּוֹרָה': 'Rouleau de la Torah',
                    'מִתְפַּלֵּל': 'Prie',
                    'לוֹמֵד': 'Étudie',
                    'מְבָרֵךְ': 'Bénit',
                    'אוֹמֵר': 'Dit',
                    'מִתְאַבֵּל': 'Est en deuil',
                    'קוֹרֵעַ': 'Déchire (le vêtement)',
                    'מַסְפִּיד': 'Prononce l\'éloge funèbre'
                };
                hebrewText = hebrewText.replace(regex, (match, p1, p2, p3) => {
                    const translation = translations[nikud] || nikud;
                    const isMourningTerm = [
                        'אָבֵל', 'שִׁבְעָה', 'אֲבֵלוּת', 'קְבוּרָה', 'הֶסְפֵּד',
                        'נִפְטָר', 'מֵת', 'קְרִיעָה', 'אֲנִינוּת', 'הַלְוָיָה',
                        'נִיחוּם', 'אֲבֵלִים', 'מְנַחֵם', 'קַדִּישׁ', 'יָארְצַייט',
                        'נְשָׁמָה', 'עוֹלָם הַבָּא', 'בֵּית הַקְּבָרוֹת', 'מַצֵּבָה',
                        'זֵכֶר', 'לִבְרָכָה', 'נֵר נְשָׁמָה', 'יִזְכּוֹר'
                    ].includes(nikud);
                    const classes = `torah-term nikud${isMourningTerm ? ' mourning-term' : ''}`;
                    return `${p1}<span class="${classes}" data-translation="${translation}">${nikud}</span>${p3}`;
                });
            });
            
            if (segment.section_title && segment.section_title !== currentSection) {
                currentSection = segment.section_title;
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-title';
                sectionDiv.textContent = currentSection;
                textContainer.appendChild(sectionDiv);
            }
            
            // Détection de section
            const matchedSection = sectionPatterns.find(p => p.pattern.test(hebrewText));
            if (matchedSection && matchedSection.title !== currentSection) {
                currentSection = matchedSection.title;
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-title';
                sectionDiv.id = matchedSection.id;
                sectionDiv.setAttribute('role', 'heading');
                sectionDiv.setAttribute('aria-level', '1');
                sectionDiv.innerHTML = `
                    <div class="section-hebrew" lang="he" dir="rtl">${matchedSection.hebrew}</div>
                    <div class="section-french" lang="fr">${matchedSection.title}</div>
                `;
                const sectionWrapper = document.createElement('div');
                sectionWrapper.className = 'section-wrapper';
                sectionWrapper.appendChild(sectionDiv);
                textContainer.appendChild(sectionWrapper);
                
                // Mark all segments in this section
                segments.forEach((seg, idx) => {
                    if (matchedSection.pattern.test(seg.hebrew)) {
                        const segDiv = document.getElementById(`segment-${idx}`);
                        if (segDiv) {
                            segDiv.setAttribute('data-section', matchedSection.id);
                        }
                    }
                });
            }
            
            // Détection de source
            let sourceRef = '';
            for (const {pattern, source} of sourcePatterns) {
                if (pattern.test(hebrewText)) {
                    sourceRef = source;
                    break;
                }
            }
            
            // Set section data attribute if matched
            if (matchedSection) {
                div.setAttribute('data-section', matchedSection.id);
            }
            
            div.innerHTML = `
                <div class="hebrew-text">${hebrewText}</div>
                <div class="french-text">${segment.french}</div>
                ${sourceRef ? `<div class="source-reference">Source: ${sourceRef}</div>` : ''}
            `;
            div.id = `segment-${index}`;
            
            div.addEventListener('click', () => {
                audioPlayer.currentTime = segment.start;
                audioPlayer.play().catch(e => console.error('Erreur de lecture:', e));
                highlightSegment(index);
            });
            
            textContainer.appendChild(div);
        });
    }
    
    function highlightSegment(index) {
        if (index === lastActiveIndex || index < 0 || index >= textContent.length) return;
        
        // Remove active state from all segments and sections
        document.querySelectorAll('.segment, .section-title').forEach(div => {
            div.classList.remove('active', 'active-section');
            div.style.transform = '';
        });
        
        const activeDiv = document.getElementById(`segment-${index}`);
        if (!activeDiv) return;
        
        // Add active state to current segment
        activeDiv.classList.add('active');
        activeDiv.style.transform = 'translateY(-2px) scale(1.01)';
        
        // Find and highlight the corresponding section
        const sectionId = activeDiv.getAttribute('data-section-id');
        const sectionTitle = activeDiv.getAttribute('data-section-title');
        
        if (sectionId) {
            const sectionDiv = document.getElementById(sectionId);
            if (sectionDiv) {
                sectionDiv.classList.add('active-section');
                
                // Update section visibility state
                const sections = document.querySelectorAll('.section-title');
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
                    section.classList.toggle('section-visible', isVisible);
                });
                
                // Ensure section is visible when needed
                const sectionRect = sectionDiv.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const isPartiallyVisible = 
                    sectionRect.top < viewportHeight && 
                    sectionRect.bottom >= 0;
                
                if (!isPartiallyVisible) {
                    const scrollOptions = { 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    };
                    
                    // Scroll to section with a slight delay to ensure smooth transition
                    setTimeout(() => {
                        sectionDiv.scrollIntoView(scrollOptions);
                    }, 100);
                }
            }
        }
        
        // Enhanced scroll behavior for active segment with section awareness
        if (autoScroll) {
            const container = document.querySelector('.text-container');
            const containerRect = container.getBoundingClientRect();
            const activeDivRect = activeDiv.getBoundingClientRect();
            const buffer = 120; // Increased buffer space for better visibility
            
            const isFullyVisible = 
                activeDivRect.top >= containerRect.top + buffer && 
                activeDivRect.bottom <= containerRect.bottom - buffer;
            
            if (!isFullyVisible) {
                requestAnimationFrame(() => {
                    // Calculate optimal scroll position considering section headers
                    const scrollOptions = {
                        behavior: 'smooth',
                        block: activeDivRect.top < containerRect.top ? 'start' : 'center',
                        inline: 'nearest'
                    };
                    
                    activeDiv.scrollIntoView(scrollOptions);
                });
            }
        }
        
        lastActiveIndex = index;
        
        // Update section visibility states
        document.querySelectorAll('.section-title').forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const isVisible = sectionRect.top < window.innerHeight && sectionRect.bottom >= 0;
            section.classList.toggle('section-visible', isVisible);
        });
    }
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });
    
    // Gestion des raccourcis clavier
    // Fonction de navigation entre segments
    function navigateSegments(direction) {
        const currentActive = document.querySelector('.segment.active');
        if (!currentActive) return;
        
        const currentIndex = parseInt(currentActive.id.split('-')[1]);
        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(textContent.length - 1, currentIndex + 1);
            
        if (newIndex !== currentIndex) {
            const segment = textContent[newIndex];
            audioPlayer.currentTime = (segment.start / 2659.08) * audioPlayer.duration;
            highlightSegment(newIndex);
        }
    }
    
    // Configuration des métadonnées MediaSession pour une meilleure expérience mobile
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Cours de Torah - Lois de deuil',
            artist: 'Rabbi Abichid',
            album: 'Cours de Halakha',
            artwork: [
                { src: 'https://via.placeholder.com/96', sizes: '96x96', type: 'image/png' },
                { src: 'https://via.placeholder.com/128', sizes: '128x128', type: 'image/png' },
                { src: 'https://via.placeholder.com/192', sizes: '192x192', type: 'image/png' },
                { src: 'https://via.placeholder.com/256', sizes: '256x256', type: 'image/png' },
                { src: 'https://via.placeholder.com/384', sizes: '384x384', type: 'image/png' },
                { src: 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => navigateSegments('up'));
        navigator.mediaSession.setActionHandler('nexttrack', () => navigateSegments('down'));
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            const skipTime = 5;
            audioPlayer.currentTime = Math.max(audioPlayer.currentTime - skipTime, 0);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            const skipTime = 5;
            audioPlayer.currentTime = Math.min(audioPlayer.currentTime + skipTime, audioPlayer.duration);
        });
    }
        
        // Mise à jour de la position de lecture
        audioPlayer.addEventListener('timeupdate', () => {
            if ('setPositionState' in navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: audioPlayer.duration,
                    playbackRate: audioPlayer.playbackRate,
                    position: audioPlayer.currentTime
                });
            }
        });
    
    document.addEventListener('keydown', (e) => {
        const currentActive = document.querySelector('.segment.active');
        if (!currentActive) return;
        
        const currentIndex = parseInt(currentActive.id.split('-')[1]);
        let newIndex = currentIndex;
        
        switch(e.key) {
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - 1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                newIndex = Math.min(textContent.length - 1, currentIndex + 1);
                e.preventDefault();
                break;
            case ' ':
                if (audioPlayer.paused) {
                    audioPlayer.play();
                } else {
                    audioPlayer.pause();
                }
                e.preventDefault();
                break;
            case 'r':
                audioPlayer.currentTime = (textContent[currentIndex].start / 2659.08) * audioPlayer.duration;
                e.preventDefault();
                break;
        }
        
        if (newIndex !== currentIndex) {
            const segment = textContent[newIndex];
            audioPlayer.currentTime = (segment.start / 2659.08) * audioPlayer.duration;
            highlightSegment(newIndex);
        }
    });

    // Sauvegarde périodique de la position
    let lastSaveTime = 0;
    const SAVE_INTERVAL = 5000; // 5 secondes
    
    audioPlayer.addEventListener('timeupdate', () => {
        const realTime = (audioPlayer.currentTime / audioPlayer.duration) * 2659.08;
        timeDisplay.textContent = formatTime(realTime);
        
        const currentSegment = textContent.findIndex(segment => 
            realTime >= segment.start && realTime < segment.end
        );
        
        if (currentSegment !== -1) {
            // Gestion du chargement dynamique des segments
            const newStart = Math.max(0, currentSegment - Math.floor(SEGMENT_BATCH_SIZE / 2));
            const newEnd = Math.min(textContent.length, newStart + SEGMENT_BATCH_SIZE);
            
            if (newStart !== visibleSegmentRange.start || newEnd !== visibleSegmentRange.end) {
                visibleSegmentRange = { start: newStart, end: newEnd };
                const visibleSegments = textContent.slice(newStart, newEnd);
                displayText(visibleSegments);
            }
            
            highlightSegment(currentSegment);
            appState.lastLoadedSegment = textContent[currentSegment];
            
            // Sauvegarde périodique
            const now = Date.now();
            if (now - lastSaveTime > SAVE_INTERVAL) {
                cacheSegments(textContent);
                lastSaveTime = now;
            }
        }
    });
    
    function initializeContent() {
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
        
        updateAppState({ isLoading: true, hasError: false });
        
        // Charger depuis le cache pendant le chargement
        const cachedData = loadFromCache();
        if (cachedData) {
            console.log('Utilisation du cache pendant le chargement');
            textContent = cachedData;
            displayText(cachedData);
            
            // Restaurer la position précédente
            if (appState.lastLoadedSegment) {
                const segmentIndex = textContent.findIndex(s => 
                    s.start === appState.lastLoadedSegment.start && 
                    s.end === appState.lastLoadedSegment.end
                );
                if (segmentIndex !== -1) {
                    audioPlayer.currentTime = (textContent[segmentIndex].start / 2659.08) * audioPlayer.duration;
                    highlightSegment(segmentIndex);
                }
            }
        }
        
        let retryCount = 0;
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 3000;
        
        function fetchWithRetry() {
            const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        fetch(baseUrl + 'translated_segments.json', {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Format de données invalide');
            }
            textContent = data;
            cacheSegments(data);
            displayText(textContent);
            updateAppState({ isLoading: false });
            
            if (appState.lastLoadedSegment) {
                const segmentIndex = textContent.findIndex(s => 
                    s.start === appState.lastLoadedSegment.start && 
                    s.end === appState.lastLoadedSegment.end
                );
                if (segmentIndex !== -1) {
                    highlightSegment(segmentIndex);
                }
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            
            if (retryCount < MAX_RETRIES) {
                console.log(`Tentative de rechargement ${retryCount + 1}/${MAX_RETRIES}...`);
                retryCount++;
                setTimeout(fetchWithRetry, RETRY_DELAY);
                return;
            }
            
            handleError(error);
            const cachedData = loadFromCache();
            if (cachedData) {
                console.log('Utilisation des données en cache après échec');
                textContent = cachedData;
                displayText(cachedData);
                updateStatus();
                
                // Notification à l'utilisateur
                statusContainer.innerHTML = '<div class="info">Mode hors-ligne - Utilisation du cache</div>';
                setTimeout(() => statusContainer.innerHTML = '', 5000);
            } else {
                document.getElementById('text-content').innerHTML = 
                    '<p>Erreur lors du chargement du contenu. Veuillez rafraîchir la page.</p>';
            }
        });
        }
        
        fetchWithRetry();
    }
    
    // Système de cache local
    function cacheSegments(segments) {
        if (!segments || !Array.isArray(segments) || segments.length === 0) {
            console.warn('Tentative de mise en cache de segments invalides');
            return;
        }
        
        try {
            localStorage.removeItem('torahLessonCache');
            const cacheData = {
                segments,
                lastUpdate: new Date().toISOString(),
                audioTime: audioPlayer.currentTime || 0,
                version: '1.0',
                totalSegments: segments.length,
                lastPosition: {
                    segment: appState.lastLoadedSegment,
                    scroll: window.scrollY,
                    timestamp: Date.now()
                }
            };
            
            const usedSpace = new Blob([JSON.stringify(cacheData)]).size;
            const maxSpace = 5 * 1024 * 1024; // 5MB limit
            
            if (usedSpace > maxSpace) {
                console.warn('Cache trop volumineux, réduction...');
                const currentSegment = textContent.findIndex(s => s === appState.lastLoadedSegment);
                const reducedSegments = segments.slice(
                    Math.max(0, currentSegment - 25),
                    Math.min(segments.length, currentSegment + 25)
                );
                cacheData.segments = reducedSegments;
                cacheData.reduced = true;
            }
            
            localStorage.setItem('torahLessonCache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Erreur lors de la mise en cache :', error);
            if (error.name === 'QuotaExceededError') {
                localStorage.clear();
                const currentSegment = textContent.findIndex(s => s === appState.lastLoadedSegment);
                cacheSegments(segments.slice(
                    Math.max(0, currentSegment - 10),
                    Math.min(segments.length, currentSegment + 10)
                ));
            }
        }
    }

    function loadFromCache() {
        try {
            const cached = localStorage.getItem('torahLessonCache');
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            if (!data || !data.segments || !Array.isArray(data.segments)) {
                console.warn('Cache corrompu, suppression...');
                localStorage.removeItem('torahLessonCache');
                return null;
            }
            
            const cacheAge = new Date() - new Date(data.lastUpdate);
            const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 heures
            
            if (cacheAge > MAX_CACHE_AGE) {
                console.log('Cache expiré, suppression...');
                localStorage.removeItem('torahLessonCache');
                return null;
            }
            
            if (data.audioTime) {
                audioPlayer.currentTime = data.audioTime;
            }
            return data.segments;
        } catch (error) {
            console.warn('Erreur lors du chargement du cache :', error);
            localStorage.removeItem('torahLessonCache');
            return null;
        }
    }
    
    // Initialisation avec vérification du cache et restauration de la position
    async function initializeFromCache() {
        try {
            const cachedData = loadFromCache();
            if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                console.log('Chargement initial depuis le cache');
                textContent = cachedData;
                displayText(cachedData);
                await updateStatus();
                
                // Afficher un message de reprise
                const statusContainer = document.getElementById('status-container');
                statusContainer.innerHTML = '<div class="info">Reprise de la dernière session...</div>';
                setTimeout(() => {
                    if (!appState.hasError) {
                        statusContainer.innerHTML = '';
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du cache:', error);
            handleError(error);
        }
    }
    
    // Initialiser l'application
    (async () => {
        await initializeFromCache();
        await initializeContent();
    })();
    
    // Gestion des événements audio et réseau
    audioPlayer.addEventListener('play', () => {
        console.log('Lecture démarrée');
        if (appState.lastLoadedSegment) {
            const segmentIndex = textContent.findIndex(s => s === appState.lastLoadedSegment);
            if (segmentIndex !== -1) {
                highlightSegment(segmentIndex);
            }
        }
    });

    audioPlayer.addEventListener('pause', () => {
        console.log('Lecture en pause');
        // Sauvegarder la position actuelle
        if (appState.lastLoadedSegment) {
            cacheSegments(textContent);
        }
    });

    audioPlayer.addEventListener('seeking', () => {
        console.log('Recherche en cours...');
        // Réinitialiser les erreurs lors d'une recherche manuelle
        consecutiveErrors = 0;
    });

    audioPlayer.addEventListener('seeked', () => {
        console.log('Nouvelle position');
        // Forcer la mise à jour de la position
        updateSegmentPosition(audioPlayer.currentTime);
    });

    // Gestion des événements réseau
    let retryTimeout = null;
    
    window.addEventListener('online', () => {
        if (appState.hasError) {
            console.log('Connexion rétablie, tentative de rechargement...');
            const statusContainer = document.getElementById('status-container');
            statusContainer.innerHTML = '<div class="info">Reconnexion en cours...</div>';
            
            clearTimeout(retryTimeout);
            retryTimeout = setTimeout(() => {
                initializeContent();
            }, 1500);
        }
    });
    
    window.addEventListener('offline', () => {
        handleError(new Error('Connexion perdue - utilisation du cache'));
        const cachedData = loadFromCache();
        if (cachedData) {
            textContent = cachedData;
            displayText(cachedData);
        }
    });
    
    // Gestion de la visibilité et de la connectivité
    let reconnectionTimer = null;
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('Page visible, vérification du statut...');
            if (appState.hasError || !navigator.onLine) {
                initializeContent();
            } else {
                loadNewSegments();
            }
        }
    });
    
    window.addEventListener('online', () => {
        console.log('Connexion rétablie');
        clearTimeout(reconnectionTimer);
        const statusContainer = document.getElementById('status-container');
        statusContainer.innerHTML = '<div class="info">Connexion rétablie, synchronisation...</div>';
        
        // Attendre un court instant pour s'assurer que la connexion est stable
        setTimeout(() => {
            initializeContent();
        }, 1500);
    });
    
    window.addEventListener('offline', () => {
        console.log('Connexion perdue');
        const statusContainer = document.getElementById('status-container');
        statusContainer.innerHTML = '<div class="error">Connexion perdue - Mode hors-ligne actif</div>';
        
        // Planifier des tentatives de reconnexion
        const scheduleReconnection = (attempt = 1) => {
            const MAX_ATTEMPTS = 5;
            const DELAY = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
            
            if (attempt <= MAX_ATTEMPTS) {
                reconnectionTimer = setTimeout(() => {
                    if (!navigator.onLine) {
                        console.log(`Tentative de reconnexion ${attempt}/${MAX_ATTEMPTS}...`);
                        statusContainer.innerHTML = 
                            `<div class="loading">Tentative de reconnexion ${attempt}/${MAX_ATTEMPTS}...</div>`;
                        scheduleReconnection(attempt + 1);
                    }
                }, DELAY);
            } else {
                statusContainer.innerHTML = 
                    '<div class="error">Impossible de rétablir la connexion - Mode hors-ligne</div>';
            }
        };
        
        scheduleReconnection();
    });
    
    // Constantes et variables de synchronisation audio/texte
    const SYNC_TOLERANCE = 1.2; // 1200ms de tolérance
    const MAX_RECOVERY_WINDOW = 4.0; // 4.0s fenêtre maximale de récupération
    const MAX_CONSECUTIVE_ERRORS = 3;
    const TIME_UPDATE_THRESHOLD = 100; // ms
    const SYNC_RESET_INTERVAL = 10000; // 10 secondes
    
    let lastTimeUpdate = 0;
    let lastValidSync = Date.now();
    let updateThrottleTimeout = null;
    let lastSegmentIndex = -1;
    let consecutiveErrors = 0;
    let lastValidSegment = null;

    // Mise à jour unifiée de la position audio
    let lastValidRealTime = 0;
    let recoveryMode = false;
    
    audioPlayer.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastTimeUpdate > TIME_UPDATE_THRESHOLD) {
            lastTimeUpdate = now;
            clearTimeout(updateThrottleTimeout);
            updateThrottleTimeout = setTimeout(() => {
                const currentTime = audioPlayer.currentTime;
                
                if (!currentTime || isNaN(currentTime)) {
                    if (lastValidTime > 0) {
                        audioPlayer.currentTime = lastValidTime;
                        return;
                    }
                    return;
                }
                
                const realTime = currentTime;
                if (isNaN(realTime)) {
                    if (lastValidRealTime > 0) {
                        audioPlayer.currentTime = lastValidRealTime;
                        return;
                    }
                    return;
                }
                
                lastValidRealTime = realTime;
                
                const currentSegment = textContent.find(segment => 
                    realTime >= segment.start && realTime < segment.end
                );
                
                if (currentSegment) {
                    const segmentIndex = textContent.indexOf(currentSegment);
                    if (segmentIndex !== lastSegmentIndex) {
                        highlightSegment(segmentIndex);
                        lastSegmentIndex = segmentIndex;
                        appState.lastLoadedSegment = currentSegment;
                        timeDisplay.textContent = formatTime(realTime);
                        
                        if (autoScroll) {
                            const activeDiv = document.getElementById(`segment-${segmentIndex}`);
                            if (activeDiv) {
                                activeDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }
                } else {
                    updateSegmentPosition(currentTime);
                }
            }, 50);
        }
    });
    
    function updateSegmentPosition(currentTime) {
        if (!audioPlayer.duration && !recoveryMode) {
            console.warn('Durée audio non disponible');
            recoveryMode = true;
            setTimeout(() => { recoveryMode = false; }, 1000);
            return;
        }
        
        // Réinitialisation progressive des erreurs
        const now = Date.now();
        if (now - lastValidSync > 10000) { // 10 secondes sans synchronisation valide
            consecutiveErrors = Math.max(1, Math.floor(consecutiveErrors / 2));
            lastValidSync = now;
            console.log('Réinitialisation progressive des erreurs:', consecutiveErrors);
        }

        try {
            const realTime = currentTime;
            
            if (isNaN(realTime)) {
                if (lastValidRealTime > 0) {
                    audioPlayer.currentTime = lastValidRealTime;
                    return;
                }
                console.warn('Temps de lecture invalide');
                return;
            }
            
            lastValidRealTime = realTime;

            // Vérifier la validité des segments
            if (!Array.isArray(textContent) || textContent.length === 0) {
                handleError(new Error('segments manquants'));
                return;
            }

            // Trouver le segment actuel avec une marge de tolérance
            const TOLERANCE = 1.2; // 1200ms de tolérance pour la cohérence
            const segmentIndex = textContent.findIndex(segment => 
                (realTime + TOLERANCE) >= segment.start && (realTime - TOLERANCE) < segment.end
            );
            
            if (segmentIndex === -1) {
                consecutiveErrors++;
                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                    const windowSize = Math.min(10, Math.max(3, consecutiveErrors));
                    console.warn(`Tentative de resynchronisation avancée (fenêtre: ${windowSize}s)`);
                    
                    // Recherche adaptative du segment le plus proche
                    const WINDOW_SIZE = windowSize;
                    const currentPosition = Math.floor(realTime);
                    
                    const nearbySegments = textContent.filter(segment => 
                        Math.abs(segment.start - currentPosition) <= WINDOW_SIZE
                    );
                    
                    if (nearbySegments.length > 0) {
                        const nearestSegment = nearbySegments.reduce((prev, curr) => {
                            const prevDiff = Math.abs(prev.start - realTime);
                            const currDiff = Math.abs(curr.start - realTime);
                            return currDiff < prevDiff ? curr : prev;
                        });
                        
                        const nearestIndex = textContent.indexOf(nearestSegment);
                        if (nearestIndex !== -1) {
                            console.log('Récupération avec segment proche');
                            highlightSegment(nearestIndex);
                            consecutiveErrors = 0;
                            
                            const statusContainer = document.getElementById('status-container');
                            statusContainer.innerHTML = '<div class="info">Synchronisation ajustée</div>';
                            setTimeout(() => statusContainer.innerHTML = '', 2000);
                            return;
                        }
                    }
                    
                    handleError(new Error('synchronisation perdue'));
                }
                return;
            }
            
            consecutiveErrors = 0;
            if (segmentIndex !== lastSegmentIndex) {
                lastSegmentIndex = segmentIndex;
                highlightSegment(segmentIndex);
                
                if (appState.lastLoadedSegment !== textContent[segmentIndex]) {
                    appState.lastLoadedSegment = textContent[segmentIndex];
                    cacheSegments(textContent);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la position:', error);
            handleError(error);
        }
    }
    
    // Gestionnaire unifié des mises à jour de temps
    let updateTimeout = null;
    let lastValidTime = 0;
    window.textContent = []; // Rendre textContent global
    
    // Charger les segments immédiatement
    console.log('Chargement initial des segments...');
    audioPlayer.src = 'audio.mp3';
    
    async function initializeSegments() {
        try {
            const response = await fetch('translated_segments.json');
            console.log('Statut de la réponse:', response.status);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Format de données invalide ou segments vides');
            }
            window.textContent = data;
            console.log('Segments chargés:', window.textContent.length);
            displayText(window.textContent);
            updateStatus();
            
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'Cours de Torah',
                    artist: 'Rabbi Abichid',
                    album: 'Cours sur les lois du deuil',
                    artwork: [
                        { src: 'https://via.placeholder.com/96', sizes: '96x96', type: 'image/png' },
                        { src: 'https://via.placeholder.com/128', sizes: '128x128', type: 'image/png' },
                        { src: 'https://via.placeholder.com/192', sizes: '192x192', type: 'image/png' },
                        { src: 'https://via.placeholder.com/256', sizes: '256x256', type: 'image/png' },
                        { src: 'https://via.placeholder.com/384', sizes: '384x384', type: 'image/png' },
                        { src: 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/png' }
                    ]
                });
            }
            
            const cachedData = loadFromCache();
            if (!cachedData) {
                cacheSegments(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des segments:', error);
            statusContainer.innerHTML = '<div class="error">Erreur lors du chargement des segments. Veuillez rafraîchir la page.</div>';
            
            const cachedData = loadFromCache();
            if (cachedData) {
                console.log('Utilisation des données en cache');
                window.textContent = cachedData;
                displayText(cachedData);
            }
        }
    }
    
    initializeSegments();
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = 2659.08; // Durée fixe connue
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            try {
                const state = {
                    duration: duration,
                    playbackRate: audioPlayer.playbackRate || 1,
                    position: audioPlayer.currentTime || 0
                };
                navigator.mediaSession.setPositionState(state);
            } catch (error) {
                console.warn('Erreur MediaSession:', error);
            }
        }
        totalTimeDisplay.textContent = formatTime(duration);
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        if (updateTimeout) return;
        
        updateTimeout = setTimeout(() => {
            updateTimeout = null;
            
            const currentTime = audioPlayer.currentTime;
            const duration = audioPlayer.duration || 2659.08;
            
            if (isNaN(currentTime)) {
                console.warn('Temps audio invalide');
                return;
            }
            
            lastValidTime = currentTime;
            timeDisplay.textContent = formatTime(currentTime);
            
            // Réinitialisation progressive des erreurs après synchronisation stable
            if (Date.now() - lastValidSync > 10000) {
                consecutiveErrors = Math.max(0, consecutiveErrors - 1);
                lastValidSync = Date.now();
            }
            
            let currentSegment = -1;
            
            // Recherche exacte avec tolérance fixe
            currentSegment = textContent.findIndex(segment => 
                (currentTime + SYNC_TOLERANCE) >= segment.start && 
                (currentTime - SYNC_TOLERANCE) < segment.end &&
                (!lastValidSegment || segment.start >= lastValidSegment.start)
            );
            
            // Si pas de correspondance exacte, utiliser la fenêtre glissante
            if (currentSegment === -1) {
                consecutiveErrors++;
                
                // Utiliser le dernier segment valide comme point de référence
                const referenceTime = lastValidSegment ? 
                    (lastValidSegment.start + (currentTime - lastValidTime)) : 
                    currentTime;
                
                if (consecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
                    const windowStart = Math.max(0, referenceTime - MAX_RECOVERY_WINDOW);
                    const windowEnd = referenceTime + MAX_RECOVERY_WINDOW;
                    
                    const nearbySegments = textContent.filter(segment => 
                        segment.start >= windowStart && 
                        segment.start <= windowEnd &&
                        (!lastValidSegment || segment.start >= lastValidSegment.start)
                    );
                    
                    if (nearbySegments.length > 0) {
                        const nearestSegment = nearbySegments.reduce((prev, curr) => {
                            const prevDiff = Math.abs(prev.start - referenceTime);
                            const currDiff = Math.abs(curr.start - referenceTime);
                            return currDiff < prevDiff ? curr : prev;
                        });
                        
                        const timeDiff = Math.abs(nearestSegment.start - currentTime);
                        
                        if (timeDiff < MAX_RECOVERY_WINDOW) {
                            currentSegment = textContent.indexOf(nearestSegment);
                            console.log('Segment récupéré:', currentSegment, 'Décalage:', timeDiff.toFixed(2), 's');
                            
                            const statusContainer = document.getElementById('status-container');
                            if (timeDiff > SYNC_TOLERANCE) {
                                const adjustedTime = nearestSegment.start + 0.1;
                                audioPlayer.currentTime = adjustedTime;
                                console.log('Resynchronisation audio à:', adjustedTime.toFixed(2), 's');
                                consecutiveErrors = Math.max(0, consecutiveErrors - 1);
                                lastValidSegment = nearestSegment;
                                
                                statusContainer.innerHTML = '<div class="info">Ajustement de la synchronisation...</div>';
                                setTimeout(() => {
                                    if (statusContainer.innerHTML.includes('Ajustement')) {
                                        statusContainer.innerHTML = '';
                                    }
                                }, 2000);
                            } else {
                                consecutiveErrors = 0;
                                lastValidSegment = nearestSegment;
                                
                                if (statusContainer.innerHTML.includes('sync')) {
                                    statusContainer.innerHTML = '';
                                }
                            }
                            
                            highlightSegment(currentSegment);
                            return;
                        } else {
                            console.warn('Segment trop éloigné:', timeDiff.toFixed(2), 's');
                            consecutiveErrors++;
                        }
                    }
                } else {
                    console.warn('Perte de synchronisation, tentative de récupération avancée');
                    document.getElementById('status-container').innerHTML = '<div class="loading">Resynchronisation avancée en cours...</div>';
                    
                    const referencePoint = lastValidSegment ? lastValidSegment.start : currentTime;
                    const windowSize = Math.min(MAX_RECOVERY_WINDOW * 2, Math.max(MAX_RECOVERY_WINDOW, consecutiveErrors * SYNC_TOLERANCE));
                    
                    const extendedWindow = textContent.filter(segment => {
                        const segmentDiff = Math.abs(segment.start - referencePoint);
                        return segmentDiff <= windowSize && 
                               (!lastValidSegment || segment.start >= lastValidSegment.start) &&
                               segment.start >= Math.max(0, currentTime - MAX_RECOVERY_WINDOW);
                    });
                    
                    if (extendedWindow.length > 0) {
                        const bestMatch = extendedWindow.reduce((prev, curr) => {
                            const prevDiff = Math.abs(prev.start - currentTime);
                            const currDiff = Math.abs(curr.start - currentTime);
                            return currDiff < prevDiff ? curr : prev;
                        });
                        
                        const adjustedTime = bestMatch.start + SYNC_TOLERANCE / 2;
                        console.log('Récupération étendue, nouveau temps:', adjustedTime.toFixed(2), 's');
                        console.log('Distance depuis dernier segment valide:', 
                            lastValidSegment ? (bestMatch.start - lastValidSegment.start).toFixed(2) : 'N/A', 's');
                        
                        const statusContainer = document.getElementById('status-container');
                        statusContainer.innerHTML = '<div class="warning">Resynchronisation avancée...</div>';
                        
                        audioPlayer.currentTime = adjustedTime;
                        const segmentIndex = textContent.indexOf(bestMatch);
                        highlightSegment(segmentIndex);
                        lastValidSegment = bestMatch;
                        lastValidSync = Date.now();
                        consecutiveErrors = Math.max(0, consecutiveErrors - 2);
                        
                        setTimeout(() => {
                            if (statusContainer.innerHTML.includes('Resynchronisation avancée')) {
                                const timeDiff = Math.abs(bestMatch.start - audioPlayer.currentTime);
                                if (timeDiff <= SYNC_TOLERANCE) {
                                    statusContainer.innerHTML = '<div class="success">Synchronisation rétablie</div>';
                                } else {
                                    statusContainer.innerHTML = '<div class="warning">Synchronisation partielle - Ajustement en cours...</div>';
                                }
                                setTimeout(() => {
                                    if (statusContainer.innerHTML.includes('Synchronisation')) {
                                        statusContainer.innerHTML = '';
                                    }
                                }, 2000);
                            }
                        }, 1000);
                        
                        statusContainer.innerHTML = '<div class="info">Synchronisation rétablie</div>';
                        setTimeout(() => statusContainer.innerHTML = '', 2000);
                        return;
                    }
                    
                    console.warn('Échec de la récupération étendue, tentative de reprise progressive');
                    const statusContainer = document.getElementById('status-container');
                    statusContainer.innerHTML = '<div class="warning">Tentative de resynchronisation progressive...</div>';
                    
                    // Utiliser le dernier segment valide comme point de référence avec tolérance
                    const safeTime = lastValidSegment ? 
                        Math.max(0, lastValidSegment.start + SYNC_TOLERANCE / 2) : 
                        Math.max(0, currentTime - MAX_RECOVERY_WINDOW);
                    
                    console.group('Tentative de resynchronisation');
                    console.log(`Position actuelle: ${currentTime.toFixed(2)}s`);
                    console.log(`Point de reprise: ${safeTime.toFixed(2)}s`);
                    console.log(`Dernier segment valide:`, lastValidSegment ? {
                        start: lastValidSegment.start,
                        end: lastValidSegment.end,
                        diff: Math.abs(currentTime - lastValidSegment.end).toFixed(2) + 's'
                    } : 'Aucun');
                    console.log(`Erreurs consécutives: ${consecutiveErrors}`);
                    console.log(`Fenêtre de récupération: ${MAX_RECOVERY_WINDOW}s`);
                    console.log(`Tolérance: ${SYNC_TOLERANCE}s`);
                    console.groupEnd();
                    
                    audioPlayer.currentTime = safeTime;
                    consecutiveErrors = Math.max(1, consecutiveErrors - 2);
                    lastValidSync = Date.now();
                    
                    // Enregistrer l'état de synchronisation pour le débogage
                    const syncState = {
                        timestamp: new Date().toISOString(),
                        currentTime,
                        safeTime,
                        lastValidSegment: lastValidSegment ? {
                            start: lastValidSegment.start,
                            end: lastValidSegment.end
                        } : null,
                        consecutiveErrors,
                        recovered: Math.abs(currentTime - safeTime) <= SYNC_TOLERANCE
                    };
                    console.debug('État de synchronisation:', syncState);
                    
                    // Feedback progressif sur la tentative de récupération
                    setTimeout(() => {
                        const currentDiff = Math.abs(audioPlayer.currentTime - safeTime);
                        if (currentDiff <= SYNC_CONFIG.TOLERANCE) {
                            statusContainer.innerHTML = '<div class="info">Position stable trouvée, reprise de la lecture...</div>';
                            setTimeout(() => {
                                const newSegment = textContent.find(s => 
                                    audioPlayer.currentTime >= s.start && 
                                    audioPlayer.currentTime < s.end
                                );
                                if (newSegment) {
                                    statusContainer.innerHTML = '<div class="success">Lecture synchronisée reprise</div>';
                                } else {
                                    statusContainer.innerHTML = '<div class="warning">Synchronisation en cours...</div>';
                                }
                                setTimeout(() => {
                                    if (statusContainer.innerHTML.includes('Lecture') || 
                                        statusContainer.innerHTML.includes('Synchronisation')) {
                                        statusContainer.innerHTML = '';
                                    }
                                }, 2000);
                            }, 1500);
                        } else {
                            statusContainer.innerHTML = '<div class="error">Échec de la resynchronisation - Nouvelle tentative...</div>';
                            setTimeout(() => statusContainer.innerHTML = '', 2000);
                        }
                    }, 1000);
                    
                    // Réinitialiser progressivement l'état avec délai adaptatif
                    const recoveryDelay = Math.min(1500, consecutiveErrors * 500);
                    
                    // Stratégie de récupération avancée pour perte de sync extrême
                    if (consecutiveErrors >= 5) {
                        console.warn('Perte de synchronisation critique - Activation de la récupération d\'urgence');
                        statusContainer.innerHTML = '<div class="error">Perte de synchronisation - Récupération d\'urgence...</div>';
                        
                        // Recherche élargie du segment le plus proche
                        const allSegments = textContent.map(s => ({
                            ...s,
                            distance: Math.abs(s.start - currentTime)
                        })).sort((a, b) => a.distance - b.distance);
                        
                        const emergencyTarget = allSegments[0];
                        if (emergencyTarget) {
                            console.log('Point de reprise d\'urgence trouvé:', {
                                currentTime: currentTime.toFixed(2),
                                targetTime: emergencyTarget.start.toFixed(2),
                                distance: emergencyTarget.distance.toFixed(2)
                            });
                            
                            audioPlayer.currentTime = emergencyTarget.start;
                            lastValidSegment = emergencyTarget;
                            consecutiveErrors = 2; // Réinitialisation partielle
                            
                            setTimeout(() => {
                                statusContainer.innerHTML = '<div class="warning">Tentative de resynchronisation complète...</div>';
                                setTimeout(() => statusContainer.innerHTML = '', 2000);
                            }, 1500);
                            return;
                        }
                    }
                    
                    // Tentative de récupération progressive standard
                    setTimeout(() => {
                        const currentDiff = Math.abs(audioPlayer.currentTime - safeTime);
                        const statusContainer = document.getElementById('status-container');
                        
                        if (currentDiff <= SYNC_CONFIG.TOLERANCE) {
                            const nearestSegment = textContent.find(s => 
                                audioPlayer.currentTime >= s.start && 
                                audioPlayer.currentTime < s.end
                            );
                            
                            if (nearestSegment) {
                                statusContainer.innerHTML = '<div class="success">Lecture reprise depuis un point stable</div>';
                                lastValidSegment = nearestSegment;
                                consecutiveErrors = Math.max(0, consecutiveErrors - 2);
                            } else {
                                statusContainer.innerHTML = '<div class="warning">Recherche du segment correspondant...</div>';
                            }
                        } else {
                            statusContainer.innerHTML = '<div class="error">Échec de la resynchronisation - Nouvelle tentative...</div>';
                            consecutiveErrors++;
                        }
                        
                        setTimeout(() => {
                            if (statusContainer.innerHTML.includes('Lecture') || 
                                statusContainer.innerHTML.includes('Recherche') ||
                                statusContainer.innerHTML.includes('Échec')) {
                                statusContainer.innerHTML = '';
                            }
                        }, 2000);
                    }, recoveryDelay);
                    return;
                }
            } else {
                consecutiveErrors = 0;
                lastValidSync = Date.now();
            }
            
            if (currentSegment === -1) {
                const nearestSegment = textContent.reduce((prev, curr) => {
                    const prevDiff = Math.abs(prev.start - currentTime);
                    const currDiff = Math.abs(curr.start - currentTime);
                    return currDiff < prevDiff ? curr : prev;
                });
                
                if (Math.abs(nearestSegment.start - currentTime) < SYNC_TOLERANCE) {
                    const nearestIndex = textContent.indexOf(nearestSegment);
                    highlightSegment(nearestIndex);
                    lastValidSegment = nearestSegment;
                    lastValidSync = Date.now();
                    return;
                }
            }
            
            if (currentSegment !== -1) {
                if (currentSegment !== lastActiveIndex) {
                    highlightSegment(currentSegment);
                    lastActiveIndex = currentSegment;
                    lastValidSegment = textContent[currentSegment];
                    lastValidSync = Date.now();
                    consecutiveErrors = Math.max(0, consecutiveErrors - 1);
                    
                    if (appState.lastLoadedSegment !== textContent[currentSegment]) {
                        appState.lastLoadedSegment = textContent[currentSegment];
                        cacheSegments(textContent);
                    }
                    
                    if (autoScroll) {
                        const activeDiv = document.getElementById(`segment-${currentSegment}`);
                        if (activeDiv && !isElementInViewport(activeDiv)) {
                            activeDiv.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center',
                                inline: 'nearest'
                            });
                        }
                    }
                }
            } else if (textContent.length > 0) {
                updateSegmentPosition(currentTime);
            }
        }, 50);
    });
    
    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Fin de l'initialisation
    window.addEventListener('beforeunload', () => {
        if (appState.lastLoadedSegment) {
            cacheSegments(textContent);
        }
    });
});
