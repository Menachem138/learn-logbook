document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing edit functionality...');
    let segments = [];
    
    function updateDisplay() {
        const content = document.getElementById('content');
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
        fetch('translated_segments.json')
            .then(response => response.json())
            .then(data => {
                segments = data;
                console.log('Loaded segments from server:', segments.length);
                updateDisplay();
            })
            .catch(error => console.error('Error loading from server:', error));
    }
});
