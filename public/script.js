async function populateModelDropdown() {
    const modelDropdown = document.getElementById('modelDropdown');
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.style.display = 'block';
        
            
    try {
    const response = await fetch('http://localhost:8000/getModels'); 
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
    }
    catch (error)
    {
        alert(`Error fetching models: ${error.message}`);
    }
    finally 
    {
    loadingAnimation.style.display = 'none';
    }
}
document.getElementById('sendButton').addEventListener('click', async () => {
    const inputField = document.getElementById('inputField');
    const output = document.getElementById('output');
    const loadingAnimation = document.getElementById('loadingAnimation');

    output.innerHTML = '';
    const userInput = inputField.value;

    if (!userInput) 
        {
            output.textContent = 'Please enter some input.';
            return;
        }

        loadingAnimation.style.display = 'block';

        try {
            const response = await fetch(`http://localhost:8000/api?Input=${encodeURIComponent(userInput)}`);
            if (!response.ok) 
            {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const jsonResponse = await response.json();

            const renderSection = (title, content) => {
            const section = document.createElement('div');
            section.className = 'section';

            const heading = document.createElement('h3');
            heading.textContent = title;

            const pre = document.createElement('pre');
            pre.textContent = content;

            section.appendChild(heading);
            section.appendChild(pre);
            output.appendChild(section);
            };

            renderSection('Input', jsonResponse.input);
            renderSection('Result', jsonResponse.result);

            if (Array.isArray(jsonResponse.daten))
            {
                const datenContent = jsonResponse.daten.map(row => row.join(', ')).join('\n');
                renderSection('Daten', datenContent);
            } 
            else 
            {
                renderSection('Daten', 'Invalid format');
            }

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

        } catch (error) 
        {
            output.textContent = `Error: ${error.message}`;
            
        } finally 
        {
            loadingAnimation.style.display = 'none';
        }
    });

    document.getElementById('selectModelButton').addEventListener('click', async () => {
        const modelDropdown = document.getElementById('modelDropdown');
        const selectedModel = modelDropdown.value;
        const loadingAnimation = document.getElementById('loadingAnimation');

        loadingAnimation.style.display = 'block';

        try
        {
            const response = await fetch(`http://localhost:8000/model?Model=${encodeURIComponent(selectedModel)}`);
            if (!response.ok) 
            {
                throw new Error(`Model selection failed with status ${response.status}`);
            }

            alert(`Model Response: ${await response.text()}`);
        } catch (error)
        {
            alert(`Error: ${error.message}`);
        } finally 
        {
            loadingAnimation.style.display = 'none';
        }
    });

        
        window.onload = populateModelDropdown;

        
