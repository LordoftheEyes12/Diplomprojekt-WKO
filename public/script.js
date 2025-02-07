async function populateModelDropdown() {
    const modelDropdown = document.getElementById('modelDropdown');
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.classList.remove('d-none');

    try {
        const response = await fetch('http://localhost:3741/getModels');
        if (!response.ok) {
            throw new Error(`Failed to fetch models with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        for (const mod of jsonResponse) {
            const model = mod.modelName;
            const option = document.createElement('option');
            option.value = mod.modelName.replace(/:latest$/, '');
            option.textContent = mod.modelName.replace(/:latest$/, '');
            modelDropdown.appendChild(option);
        }
    } catch (error) {
        alert(`Error fetching models: ${error.message}`);
    } finally {
        loadingAnimation.classList.add('d-none');
    }
}

document.getElementById('sendButton').addEventListener('click', async () => {
    const inputField = document.getElementById('inputField');
    const output = document.getElementById('output');
    const debugIndicator = document.getElementById('debugIndicator');
    const loadingAnimation = document.getElementById('loadingAnimation');

    output.innerHTML = '';
    debugIndicator.innerHTML = '';
    const userInput = inputField.value;

    if (!userInput) {
        output.textContent = 'Please enter some input.';
        return;
    }

    loadingAnimation.classList.remove('d-none');

    try {
        const response = await fetch(`http://localhost:3741/api?Input=${encodeURIComponent(userInput)}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonResponse = await response.json();
        const isDebugMode = jsonResponse.debug === "1";

        if (isDebugMode) {
            debugIndicator.textContent = 'Reply sent in DEBUG MODE';
            debugIndicator.style.color = '#ff9800';
        }

        const renderSection = (title, content, isDebugOnly = false) => {
            if (!content || (isDebugOnly && !isDebugMode)) return;
        
            const section = document.createElement('div');
            section.className = 'section' + (isDebugOnly ? ' debug-mode' : '');
        
            const heading = document.createElement('h3');
            heading.textContent = title;
            heading.style.fontSize = 'inherit'; // Wichtig für die Skalierung
        
            const pre = document.createElement('pre');
            pre.textContent = content;
        
            section.appendChild(heading);
            section.appendChild(pre);
            output.appendChild(section);
        };

        renderSection('Input', jsonResponse.input, true);
        renderSection('Result', jsonResponse.result, true);

        if (Array.isArray(jsonResponse.daten)) {
            const datenContent = jsonResponse.daten.map(row => row.join(', ')).join('\n');
            renderSection('Daten', datenContent);
        } else {
            renderSection('Daten', 'Invalid format');
        }

        if (jsonResponse.mdTable) {
            const markdownContainer = document.createElement('div');
            markdownContainer.className = 'section';

            const markdownHeading = document.createElement('h3');
            markdownHeading.textContent = 'Markdown Table';

            const markdownContent = document.createElement('div');
            markdownContent.className = 'markdown';
            markdownContent.innerHTML = marked.parse(jsonResponse.mdTable || '');

            markdownContainer.appendChild(markdownHeading);
            markdownContainer.appendChild(markdownContent);
            output.appendChild(markdownContainer);
        }

    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    } finally {
        loadingAnimation.classList.add('d-none');
    }
});

document.getElementById('selectModelButton').addEventListener('click', async () => {
    const modelDropdown = document.getElementById('modelDropdown');
    const selectedModel = modelDropdown.value;
    const loadingAnimation = document.getElementById('loadingAnimation');

    loadingAnimation.classList.remove('d-none');

    try {
        const response = await fetch(`http://localhost:3741/model?Model=${encodeURIComponent(selectedModel)}`);
        if (!response.ok) {
            throw new Error(`Model selection failed with status ${response.status}`);
        }

        alert(`Model Response: ${await response.text()}`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loadingAnimation.classList.add('d-none');
    }
});

document.getElementById('settingsButton').addEventListener('click', () => {
    const settingsMenu = new bootstrap.Offcanvas(document.getElementById('settingsMenu'));
    settingsMenu.toggle();
});

document.getElementById('backgroundColorPicker').addEventListener('input', (event) => {
    document.body.style.backgroundColor = event.target.value;
});

document.getElementById('textSizeSlider').addEventListener('input', (event) => {
    const textSize = event.target.value + 'px';
    
    // Only update body font size
    document.body.style.fontSize = textSize;

    // Keep form element scaling if needed:
    document.querySelectorAll('.form-control, .form-select, .btn').forEach(element => {
        element.style.fontSize = textSize;
    });

    document.getElementById('textSizeValue').textContent = textSize;
});


document.getElementById('textColorPicker').addEventListener('input', (event) => {
    const textColor = event.target.value;
    
    // Update CSS variable for standard text
    document.documentElement.style.setProperty('--text-color', textColor);
    
    // Apply to body and form elements
    document.body.style.color = textColor;
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.style.color = textColor;
    });
});

document.getElementById('headingColorPicker').addEventListener('input', (event) => {
    const headingColor = event.target.value;
    
    // Update CSS variable and apply to headings
    document.documentElement.style.setProperty('--heading-color', headingColor);
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        heading.style.color = headingColor;
    });
});

document.getElementById('buttonColorPicker').addEventListener('input', (event) => {
    const buttonColor = event.target.value;
    
    // Update CSS variable and apply to buttons
    document.documentElement.style.setProperty('--button-color', buttonColor);
    document.querySelectorAll('.btn').forEach(button => {
        button.style.color = buttonColor + '!important';
    });
});

document.getElementById('datasetButton').addEventListener('click', async () => {
    const inputField = document.getElementById('inputField');
    const output = document.getElementById('output');
    const debugIndicator = document.getElementById('debugIndicator');
    const loadingAnimation = document.getElementById('loadingAnimation');

    output.innerHTML = '';
    debugIndicator.innerHTML = '';
    const userInput = inputField.value;

    if (!userInput) {
        output.textContent = 'Please enter some input.';
        return;
    }

    loadingAnimation.classList.remove('d-none');

    try {
        const response = await fetch(`http://localhost:3741/dataset?Input=${encodeURIComponent(userInput)}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const text = await response.text();
        const renderSection = (title, content, isDebugOnly = false) => {
            if (!content || (isDebugOnly && !isDebugMode)) return;
        
            const section = document.createElement('div');
            section.className = 'section' + (isDebugOnly ? ' debug-mode' : '');
        
            const heading = document.createElement('h3');
            heading.textContent = title;
            heading.style.fontSize = 'inherit'; // Wichtig für die Skalierung
        
            const pre = document.createElement('pre');
            pre.textContent = content;
        
            section.appendChild(heading);
            section.appendChild(pre);
            output.appendChild(section);
        };

        renderSection('Response', text, false);



    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    } finally {
        loadingAnimation.classList.add('d-none');
    }
});

window.onload = populateModelDropdown;