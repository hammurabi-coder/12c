// ==UserScript==
// @name         Perseus Suetonius Extractor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract and display full Latin text from Perseus Suetonius pages
// @match        https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0061*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get the life parameter from URL (e.g., jul., aug., tib., etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const life = urlParams.get('life') || 'jul.';

    // Map of life codes to display names
    const lifeNames = {
        'jul.': 'Divus Iulius',
        'aug.': 'Divus Augustus',
        'tib.': 'Tiberius',
        'cal.': 'C. Caligula',
        'cl.': 'Divus Claudius',
        'nero': 'Nero',
        'gal.': 'Galba',
        'otho': 'Otho',
        'vit.': 'Vitellius',
        'ves.': 'Divus Vespasianus',
        'tit.': 'Divus Titus',
        'dom.': 'Domitianus'
    };

    // Find the main text content area
    const textChunk = document.querySelector('.text_chunk');
    if (!textChunk) {
        console.log('Perseus Suetonius Extractor: Text content not found');
        return;
    }

    // Extract all paragraphs from the text content
    const paragraphs = textChunk.querySelectorAll('p');
    let fullText = '';

    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
            fullText += text + '\n\n';
        }
    });

    // Clean up the text
    fullText = fullText.replace(/\n{3,}/g, '\n\n').trim();

    // Create a floating panel to display the extracted text
    const panel = document.createElement('div');
    panel.id = 'suetonius-extractor-panel';
    panel.innerHTML = `
        <style>
            #suetonius-extractor-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 400px;
                max-height: 80vh;
                background: #1a1a2e;
                color: #eee;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 15px;
                z-index: 9999;
                overflow-y: auto;
                font-family: Georgia, serif;
                font-size: 14px;
                line-height: 1.6;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
            #suetonius-extractor-panel h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #fff;
                border-bottom: 1px solid #444;
                padding-bottom: 8px;
            }
            #suetonius-extractor-panel .controls {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }
            #suetonius-extractor-panel button {
                background: #4a4a6a;
                color: #fff;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            #suetonius-extractor-panel button:hover {
                background: #5a5a7a;
            }
            #suetonius-extractor-panel .text-display {
                background: #0d0d1a;
                padding: 12px;
                border-radius: 4px;
                white-space: pre-wrap;
                max-height: 500px;
                overflow-y: auto;
            }
            #suetonius-extractor-panel .meta {
                font-size: 11px;
                color: #888;
                margin-top: 8px;
            }
        </style>
        <h3>Suetonius - ${lifeNames[life] || life}</h3>
        <div class="controls">
            <button id="copy-text-btn">Copy Text</button>
            <button id="download-text-btn">Download</button>
            <button id="toggle-panel-btn">Minimize</button>
        </div>
        <div class="text-display">${fullText}</div>
        <div class="meta">
            Source: Perseus Tufts<br>
            Edition: Maximilian Ihm<br>
            CTS: urn:cts:latinLit:phi1348.abo011.perseus-lat1
        </div>
    `;

    document.body.appendChild(panel);

    // Copy button
    document.getElementById('copy-text-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(fullText).then(() => {
            alert('Text copied to clipboard!');
        });
    });

    // Download button
    document.getElementById('download-text-btn').addEventListener('click', () => {
        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suetonius-${life}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Toggle panel
    document.getElementById('toggle-panel-btn').addEventListener('click', () => {
        const display = panel.querySelector('.text-display');
        const meta = panel.querySelector('.meta');
        const isVisible = display.style.display !== 'none';
        display.style.display = isVisible ? 'none' : 'block';
        meta.style.display = isVisible ? 'none' : 'block';
        document.getElementById('toggle-panel-btn').textContent = isVisible ? 'Expand' : 'Minimize';
    });

    console.log('Perseus Suetonius Extractor: Text extracted successfully');
})();
