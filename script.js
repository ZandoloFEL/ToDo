document.addEventListener('DOMContentLoaded', () => {
    let namesData = [];
    let generatedNames = [];
    let closedNames = {};

    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const floatingNamesContainer = document.createElement('div');
    floatingNamesContainer.className = 'floating-names';
    document.body.appendChild(floatingNamesContainer);

    const getDateString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    };

    const loadData = () => {
        const savedGeneratedNames = localStorage.getItem('generatedNames');
        const savedClosedNames = localStorage.getItem('closedNames');
        const savedDate = localStorage.getItem('lastGeneratedDate');

        if (savedGeneratedNames) {
            generatedNames = JSON.parse(savedGeneratedNames);
        }

        if (savedClosedNames) {
            closedNames = JSON.parse(savedClosedNames);
        }

        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                namesData = data;
                updateRemainingNames();
                updateFloatingNames();
                updateCounter();
                displayGeneratedNames();
                updateDisplayedNames();
                updateOnscreenCards();

                const currentDate = getDateString();
                if (savedDate !== currentDate) {
                    generateBtn.click();
                    localStorage.setItem('lastGeneratedDate', currentDate);
                }
            });
    };

    const saveData = () => {
        localStorage.setItem('namesData', JSON.stringify(namesData));
        localStorage.setItem('generatedNames', JSON.stringify(generatedNames));
        localStorage.setItem('closedNames', JSON.stringify(closedNames));
        localStorage.setItem('lastGeneratedDate', getDateString());
    };

    const updateRemainingNames = () => {
        generatedNames.forEach(({ name }) => {
            const nameData = namesData.find(item => item.name === name);
            if (nameData) {
                nameData.frequency -= 1;
            }
        });
        namesData = namesData.filter(item => item.frequency > 0);
    };

    const updateCounter = () => {
        const remainingCount = namesData.reduce((acc, curr) => acc + curr.frequency, 0);
        document.getElementById('remainingCount').textContent = remainingCount;
    };

    const updateDisplayedNames = () => {
        const displayedNames = generatedNames.filter(({ id }) => !closedNames[id]).map(({ name }) => name).join(', ');
        document.getElementById('displayedNames').textContent = displayedNames;
    };

    const updateOnscreenCards = () => {
        const onscreenCards = document.querySelectorAll('.cards-container .card:not(.hide)').length;
        document.getElementById('onscreenCards').textContent = onscreenCards;
        console.log("Aggiornato contatore delle carte presenti: ", onscreenCards);
    };

    const handleCardClick = (card, id) => {
        card.classList.add('hide');
        card.addEventListener('transitionend', () => {
            closedNames[id] = true;
            card.remove();
            saveData();
            updateDisplayedNames();
            updateCounter();
            updateOnscreenCards(); 
            if (document.getElementById('cardsContainer').children.length === 0) {
                generateBtn.disabled = false;
            }
        }, { once: true }); 
        updateOnscreenCards();
    };

    const displayGeneratedNames = () => {
        const cardsContainer = document.getElementById('cardsContainer');
        cardsContainer.innerHTML = '';

        generatedNames.forEach(({ name, id, background, color }) => {
            if (!closedNames[id]) {
                const card = document.createElement('div');
                card.className = 'card show';
                card.textContent = name;
                card.dataset.id = id;
                if (background && color) {
                    card.style.backgroundColor = background;
                    card.style.color = color;
                }
                card.addEventListener('click', () => handleCardClick(card, id));
                cardsContainer.appendChild(card);
                requestAnimationFrame(() => {
                    card.classList.add('show');
                });
            }
        });
        updateOnscreenCards(); 
    };

    const generateUniqueId = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    generateBtn.addEventListener('click', () => { 
        if (namesData && namesData.length > 0) {
            for (let i = 0; i < 10; i++) {
                const totalFrequency = namesData.reduce((acc, curr) => acc + curr.frequency, 0);
                let randomValue = Math.random() * totalFrequency;
                let selectedName;

                for (let item of namesData) {
                    if (randomValue < item.frequency) {
                        selectedName = item;
                        break;
                    }
                    randomValue -= item.frequency;
                }

                if (selectedName) {
                    generatedNames.push({
                        name: selectedName.name,
                        id: generateUniqueId(),
                        background: selectedName.background,
                        color: selectedName.color
                    });
                    selectedName.frequency -= 1;
                    namesData = namesData.filter(item => item.frequency > 0);
                }
            }
            saveData();
            displayGeneratedNames();
            updateFloatingNames();
            updateCounter();
            updateDisplayedNames();
            updateOnscreenCards(); 
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler resettare?')) {
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    namesData = data;
                    generatedNames = [];
                    closedNames = {};
                    document.getElementById('cardsContainer').innerHTML = '';
                    generateBtn.disabled = false;
                    updateFloatingNames();
                    saveData();
                    updateCounter();
                    updateDisplayedNames();
                    updateOnscreenCards(); 
                });
        }
    });

    function updateFloatingNames() {
        floatingNamesContainer.innerHTML = '';
        namesData.forEach(name => {
            for (let i = 0; i < name.frequency; i++) {
                const floatingName = document.createElement('div');
                floatingName.className = 'floating-name';
                floatingName.textContent = name.name;
                floatingName.style.top = `${Math.random() * 100}vh`;
                floatingName.style.left = `${Math.random() * 100}vw`;
                floatingName.style.animationDuration = `${5 + Math.random() * 10}s`;
                floatingNamesContainer.appendChild(floatingName);
                updateOnscreenCards();
            }
        });
    }

    loadData();
    updateFloatingNames();
    updateCounter();
    updateOnscreenCards();
});
