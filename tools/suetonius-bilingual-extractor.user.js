// ==UserScript==
// @name         Suetonius Bilingual Extractor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract Suetonius text from Perseus by Caesar life, with bilingual support
// @match        https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0061*
// @match        https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0132*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get the life parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const life = urlParams.get('life') || 'jul.';
    const isLatin = window.location.href.includes('1999.02.0061');
    
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
    
    // All lives in order
    const allLives = ['jul.', 'aug.', 'tib.', 'cal.', 'cl.', 'nero', 'gal.', 'otho', 'vit.', 'ves.', 'tit.', 'dom.'];
    const currentIndex = allLives.indexOf(life);

    // Find the main text content area
    let textContent = '';
    
    if (isLatin) {
        // Latin text - find text_chunk div
        const textChunk = document.querySelector('.text_chunk');
        if (textChunk) {
            const paragraphs = textChunk.querySelectorAll('p');
            paragraphs.forEach(p => {
                const text = p.textContent.trim();
                if (text) {
                    textContent += text + '\n\n';
                }
            });
        }
    } else {
        // English text - find div.text
        const textDiv = document.querySelector('div.text');
        if (textDiv) {
            // Clone and clean the content
            const clone = textDiv.cloneNode(true);
            
            // Remove footnotes
            const footnotes = clone.querySelector('.footnotes');
            if (footnotes) footnotes.remove();
            
            // Remove h4 headers (section titles we don't need)
            const h4s = clone.querySelectorAll('h4');
            h4s.forEach(h => h.remove());
            
            // Get text, preserving paragraph structure
            const paras = clone.querySelectorAll('p');
            paras.forEach(p => {
                // Skip if empty or just whitespace
                const text = p.textContent.trim();
                if (text && text.length > 10) {
                    textContent += text + '\n\n';
                }
            });
        }
    }

    // Clean up the text
    textContent = textContent.replace(/\n{3,}/g, '\n\n').trim();

    // Create the panel
    const panel = document.createElement('div');
    panel.id = 'suetonius-extractor';
    panel.innerHTML = `
        <style>
            #suetonius-extractor {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 450px;
                max-height: 85vh;
                background: #1a1a2e;
                color: #eee;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 15px;
                z-index: 9999;
                overflow-y: auto;
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 13px;
                line-height: 1.5;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
            #suetonius-extractor h3 {
                margin: 0 0 10px 0;
                font-size: 15px;
                color: #fff;
                border-bottom: 1px solid #444;
                padding-bottom: 8px;
            }
            #suetonius-extractor .controls {
                display: flex;
                gap: 6px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }
            #suetonius-extractor button {
                background: #4a4a6a;
                color: #fff;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            #suetonius-extractor button:hover {
                background: #5a5a7a;
            }
            #suetonius-extractor button:disabled {
                background: #333;
                color: #666;
                cursor: not-allowed;
            }
            #suetonius-extractor .nav-controls {
                display: flex;
                gap: 6px;
                margin-bottom: 10px;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
            }
            #suetonius-extractor .text-display {
                background: #0d0d1a;
                padding: 12px;
                border-radius: 4px;
                white-space: pre-wrap;
                max-height: 450px;
                overflow-y: auto;
                font-size: 12px;
            }
            #suetonius-extractor .meta {
                font-size: 10px;
                color: #888;
                margin-top: 8px;
            }
            #suetonius-extractor .progress {
                font-size: 10px;
                color: #6a6;
                margin-top: 5px;
            }
        </style>
        <h3>Suetonius - ${lifeNames[life] || life} (${isLatin ? 'Latin' : 'English'})</h3>
        <div class="nav-controls">
            <button id="prev-btn" ${currentIndex <= 0 ? 'disabled' : ''}>← Prev</button>
            <button id="next-btn" ${currentIndex >= allLives.length - 1 ? 'disabled' : ''}>Next →</button>
            <button id="both-btn">Fetch Both</button>
        </div>
        <div class="controls">
            <button id="copy-btn">Copy</button>
            <button id="download-btn">Download</button>
            <button id="toggle-btn">Minimize</button>
        </div>
        <div class="text-display">${textContent || 'No text found on this page.'}</div>
        <div class="meta">
            Source: Perseus Tufts<br>
            ${isLatin ? 'Latin Edition: Maximilian Ihm' : 'English Translation: Alexander Thomson, 1889'}<br>
            CTS: ${isLatin ? 'urn:cts:latinLit:phi1348.abo011.perseus-lat1' : 'urn:cts:latinLit:phi1348.abo012.perseus-lat1'}
        </div>
        <div class="progress">Life ${currentIndex + 1} of ${allLives.length}</div>
    `;

    document.body.appendChild(panel);

    // Navigation handlers
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            const baseUrl = isLatin 
                ? 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0061:life='
                : 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0132:life=';
            window.location.href = baseUrl + allLives[currentIndex - 1];
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentIndex < allLives.length - 1) {
            const baseUrl = isLatin 
                ? 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0061:life='
                : 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0132:life=';
            window.location.href = baseUrl + allLives[currentIndex + 1];
        }
    });

    document.getElementById('both-btn').addEventListener('click', () => {
        // Open both Latin and English in new tabs
        const latinUrl = 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0061:life=' + life;
        const englishUrl = 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0132:life=' + life;
        window.open(latinUrl, '_blank');
        window.open(englishUrl, '_blank');
    });

    // Copy button
    document.getElementById('copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(textContent).then(() => {
            const btn = document.getElementById('copy-btn');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 1500);
        });
    });

    // Download button
    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const lang = isLatin ? 'latin' : 'english';
        a.download = `suetonius-${life}-${lang}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Toggle panel
    document.getElementById('toggle-btn').addEventListener('click', () => {
        const display = panel.querySelector('.text-display');
        const meta = panel.querySelector('.meta');
        const progress = panel.querySelector('.progress');
        const isVisible = display.style.display !== 'none';
        display.style.display = isVisible ? 'none' : 'block';
        meta.style.display = isVisible ? 'none' : 'block';
        progress.style.display = isVisible ? 'none' : 'block';
        document.getElementById('toggle-btn').textContent = isVisible ? 'Expand' : 'Minimize';
    });

    console.log('Suetonius Extractor: Ready for', lifeNames[life] || life);
})();
