let isDebugMode;

async function populateModelDropdown() {
    const modelDropdown = document.getElementById('modelDropdown');
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.classList.remove('d-none');


    try {
        // Use the current origin instead of localhost
        const response = await fetch(`${window.location.origin}/getModels`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        for (const mod of jsonResponse) {
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
    const csvButton = document.getElementById('csvButton');
    const modelSelection = document.getElementById('modelSelection');

    output.innerHTML = '';
    debugIndicator.innerHTML = '';
    const userInput = inputField.value;
    csvButton.classList.add('d-none'); // Hide CSV button immediately

    if (!userInput) {
        output.textContent = 'Please enter some input.';
        return;
    }

    loadingAnimation.classList.remove('d-none');

    try {
        // Use the current origin for the API endpoint
        const response = await fetch(`${window.location.origin}/api?Input=${encodeURIComponent(userInput)}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonResponse = await response.json();
        isDebugMode = jsonResponse.debug === "1";

    
        if (isDebugMode) {
            debugIndicator.textContent = 'Reply sent in DEBUG MODE';
            debugIndicator.style.color = '#ff9800';
            modelSelection.classList.remove('d-none'); // Show modelSelection
        } else {
            modelSelection.classList.add('d-none'); // Hide modelSelection
        }

        const renderSection = (title, content, isDebugOnly = false) => {
            // If there's no content, or if the content is only for debug mode and debug is off, do nothing
            if (!content || (isDebugOnly && !isDebugMode)) return;
        
            const section = document.createElement('div');
            section.className = 'section' + (isDebugOnly ? ' debug-mode' : '');
        
            const heading = document.createElement('h3');
            heading.textContent = title;
            heading.style.fontSize = 'inherit'; // Important for scaling
        
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

        // Update CSV content generation
        if (Array.isArray(jsonResponse.daten) && jsonResponse.daten.length > 0) {
            // Extract headers from markdown table if available
            let headers = [];
            if (jsonResponse.mdTable) {
                const firstLine = jsonResponse.mdTable.split('\n')[0];
                headers = firstLine.split('|')
                    .map(h => h.trim())
                    .filter(h => h && !h.startsWith('---')); // Exclude markdown separator line
            }

            // Create CSV content with headers
            const rows = jsonResponse.daten.map(row => row.join(','));
            if (headers.length > 0) {
                rows.unshift(headers.join(',')); // Add headers as first line
            }
    
            const csvContent = rows.join('\n');
            csvButton.dataset.csv = csvContent;
            csvButton.classList.remove('d-none');
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
        // Use the current origin for the model selection endpoint
        const response = await fetch(`${window.location.origin}/model?Model=${encodeURIComponent(selectedModel)}`);
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

document.getElementById('buttonBgColorPicker').addEventListener('input', (event) => {
    const buttonBgColor = event.target.value;
    document.documentElement.style.setProperty('--button-bg-color', buttonBgColor);
});


document.getElementById('datasetButton').addEventListener('click', async () => {
    const inputField = document.getElementById('inputField');
    const output = document.getElementById('output');
    const debugIndicator = document.getElementById('debugIndicator');
    const loadingAnimation = document.getElementById('loadingAnimation');

    // Hide CSV button when structure request is made
    document.getElementById('csvButton').classList.add('d-none');

    output.innerHTML = '';
    debugIndicator.innerHTML = '';
    const userInput = inputField.value;

    if (!userInput) {
        output.textContent = 'Please enter some input.';
        return;
    }

    loadingAnimation.classList.remove('d-none');

   
    try {
        const response = await fetch(`${window.location.origin}/dataset?Input=${encodeURIComponent(userInput)}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const text = await response.text();
        
        // Create markdown container
        const markdownContainer = document.createElement('div');
        markdownContainer.className = 'section';

        // Parse and render markdown
        const markdownContent = document.createElement('div');
        markdownContent.className = 'markdown';
        markdownContent.innerHTML = marked.parse(text);  // This converts MD to HTML

        // Assemble elements
        markdownContainer.appendChild(markdownContent);
        output.appendChild(markdownContainer);

    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    } finally {
        loadingAnimation.classList.add('d-none');
    }
});

document.getElementById('csvButton').addEventListener('click', function() {
    const csvContent = this.dataset.csv;
    if (!csvContent) return;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;

    console.log(formattedDate);

    link.setAttribute('download', `${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

document.addEventListener("DOMContentLoaded", async function () {
    
    try {
        const response = await fetch('/debug');
        const data = await response.text();
        

        if (data == 1) {
            isDebugMode = true;
            const modelSelection = document.getElementById("modelSelection");
            if (modelSelection) {
                
                modelSelection.classList.remove("d-none");
            }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen des Debug-Modus:", error);
    }
});


document.getElementById('resetSettingsButton').addEventListener('click', () => {
    // Reset color pickers
    document.getElementById('backgroundColorPicker').value = '#121212';
    document.getElementById('textColorPicker').value = '#ffffff';
    document.getElementById('headingColorPicker').value = '#ffffff';
    document.getElementById('buttonColorPicker').value = '#ffffff';
    document.getElementById('buttonBgColorPicker').value = '#3700b3';

    // Reset text size
    document.getElementById('textSizeSlider').value = 16;
    
    // Trigger input events to apply changes
    document.getElementById('backgroundColorPicker').dispatchEvent(new Event('input'));
    document.getElementById('textColorPicker').dispatchEvent(new Event('input'));
    document.getElementById('headingColorPicker').dispatchEvent(new Event('input'));
    document.getElementById('buttonColorPicker').dispatchEvent(new Event('input'));
    document.getElementById('buttonBgColorPicker').dispatchEvent(new Event('input'));
    document.getElementById('textSizeSlider').dispatchEvent(new Event('input'));
});



window.onload = populateModelDropdown;
