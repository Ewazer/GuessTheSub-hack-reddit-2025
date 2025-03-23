window.onload = function () {
    loadPost();
    loadSemanticDictionary();
    addEventListeners();
    loadGameState();
    initializeAutoSave();
};

let revealedWords = new Map();
let wordSimilarities = new Map();
let semanticDictionary = null;
let currentPost = null;
let usedHints = new Set();
let userId = null;
let gameId = null;

function getUserId() {
    const storedUserId = localStorage.getItem('gts_user_id');
    if (storedUserId) {
        return storedUserId;
    }
    
    const newUserId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('gts_user_id', newUserId);
    return newUserId;
}

function saveGameState() {
    showSavingIndicator();
    
    const revealedWordsArray = Array.from(revealedWords.entries());
    const wordSimilaritiesArray = [];
    
    wordSimilarities.forEach((value, key) => {
        if (key instanceof Element) {
            const word = key.getAttribute('data-word');
            if (word) {
                wordSimilaritiesArray.push([word, value]);
            }
        } else if (typeof key === 'string') {
            wordSimilaritiesArray.push([key, value]);
        }
    });
    
    const state = {
        revealedWords: revealedWordsArray,
        wordSimilarities: wordSimilaritiesArray,
        usedHints: Array.from(usedHints)
    };
    
    try {
        const localStorageKey = `gts_game_${gameId}_${userId}`;
        localStorage.setItem(localStorageKey, JSON.stringify(state));
        console.log("Game state saved to localStorage");
    } catch (e) {
        console.error("Failed to save to localStorage:", e);
    }
    
    if (window.devvitAPI) {
        window.devvitAPI.sendMessage({
            type: 'saveGameState',
            userId,
            gameId,
            state
        }).then(() => {
            hideSavingIndicator(true);
        }).catch(error => {
            console.error("Failed to save game state to server:", error);
            hideSavingIndicator(true);
        });
    } else {
        hideSavingIndicator(true);
    }
}

function showSavingIndicator() {
    const existingIndicator = document.getElementById('save-indicator');
    if (!existingIndicator) {
        const indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.innerText = 'Saving...';
        indicator.style.position = 'fixed';
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.padding = '5px 10px';
        indicator.style.backgroundColor = '#0b1416';
        indicator.style.color = 'white';
        indicator.style.borderRadius = '5px';
        indicator.style.fontSize = '12px';
        indicator.style.opacity = '0.8';
        document.body.appendChild(indicator);
    }
}

function hideSavingIndicator(success) {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.innerText = success ? 'Saved!' : 'Save failed';
        indicator.style.backgroundColor = success ? '#0b5e36' : '#bc0117';
        setTimeout(() => {
            indicator.remove();
        }, 1500);
    }
}

async function loadGameState() {
    userId = getUserId();
    gameId = currentPost ? currentPost.id || 'daily_challenge' : 'daily_challenge';
        
    const localStorageKey = `gts_game_${gameId}_${userId}`;
    let localState = null;
    
    try {
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
            localState = JSON.parse(savedData);
        }
    } catch (e) {
        console.error("Error loading from localStorage:", e);
    }
    
    let serverState = null;
    if (window.devvitAPI) {
        try {
            const response = await window.devvitAPI.sendMessage({
                type: 'loadGameState',
                userId,
                gameId
            });
            
            if (response && response.state) {
                serverState = response.state;
            }
        } catch (error) {
            console.error("Failed to load game state from server:", error);
        }
    }
    
    const finalState = serverState || localState;
    
    if (finalState) {
        
        if (finalState.revealedWords) {
            revealedWords = new Map(finalState.revealedWords);
        }
        
        if (finalState.wordSimilarities) {
            finalState.wordSimilarities.forEach(([word, hint]) => {
                wordSimilarities.set(word, hint);
            });
        }
        
        if (finalState.usedHints) {
            usedHints = new Set(finalState.usedHints);
        }
        
        setTimeout(() => {
            applyGameStateToDom();
        }, 500);
    } else {
    }
}

function applyGameStateToDom() {
    revealedWords.forEach((value, key) => {
        const elements = document.querySelectorAll(`.masked-word[data-word="${key}"]`);
        if (elements.length > 0) {
            elements.forEach(element => {
                element.textContent = value;
                element.classList.add("revealed");
            });
        } else {
            console.warn(`Element with word "${key}" not found in DOM`);
        }
    });
    
    if (wordSimilarities instanceof Map) {
        wordSimilarities.forEach((hint, word) => {
            if (typeof word === 'string') {
                const elements = document.querySelectorAll(`.masked-word[data-word="${word}"]:not(.revealed)`);
                elements.forEach(element => {
                    applySemanticHint(element, hint);
                });
            }
        });
    }
    
    usedHints.forEach(hintType => {
        showHint(hintType, false);
    });
    
}

function addEventListeners() {
    const hintButton = document.querySelector('.button-indice');
    if (hintButton) {
        hintButton.addEventListener('click', showHintPopup);
    }
    
    const closeHintButton = document.querySelector('.button-popup2');
    if (closeHintButton) {
        closeHintButton.addEventListener('click', closeHintPopup);
    }
    
    const revealAllButton = document.querySelector('.button-popup');
    if (revealAllButton) {
        revealAllButton.addEventListener('click', buttonPopupclick);
    }
    
    const communityHintButton = document.querySelector('.hint-button-community .button-hint');
    if (communityHintButton) {
        communityHintButton.addEventListener('click', function() {
            showHint('community');
        });
    }
    
    const lettersHintButton = document.querySelector('.hint-button-letters .button-hint');
    if (lettersHintButton) {
        lettersHintButton.addEventListener('click', function() {
            showHint('letters');
        });
    }
    
    const categoryHintButton = document.querySelector('.hint-button-category .button-hint');
    if (categoryHintButton) {
        categoryHintButton.addEventListener('click', function() {
            showHint('category');
        });
    }
}

function loadPost() {
    fetch("post.json")
        .then(response => response.json())
        .then(data => {
            currentPost = data;
            displayPost(data);
            if (data.all_vector) {
                try {
                    currentPost.vectorData = JSON.parse(data.all_vector);
                } catch (e) {
                    const vectorString = data.all_vector.replace(/^\[|\]$/g, '').split(',');
                    currentPost.vectorData = vectorString.map(num => parseFloat(num));
                }
            }
            gameId = currentPost.id || 'daily_challenge';
            loadGameState(); 
        })
        .catch(error => console.error("Error loading JSON:", error));
}

function loadSemanticDictionary() {
    fetch("dict.json")
        .then(response => response.json())
        .then(data => {
            semanticDictionary = data;
            createReverseIndex();
        })
        .catch(error => console.error("Erreur de chargement du dictionnaire:", error));
}

let reverseIndex = {};

function createReverseIndex() {
    reverseIndex = {};
    
    for (const [key, similarWords] of Object.entries(semanticDictionary)) {
        if (!Array.isArray(similarWords)) {
            continue;
        }
        
        for (const entry of similarWords) {
            if (Array.isArray(entry) && entry.length >= 2) {
                const similarWord = entry[0].toLowerCase();
                const similarity = entry[1];
                
                if (!reverseIndex[similarWord]) {
                    reverseIndex[similarWord] = [];
                }
                
                reverseIndex[similarWord].push({
                    word: key,
                    similarity: similarity
                });
            }
        }
    }
}

function displayPost(post) {
    const postContainer = document.getElementById("post-content");

    const maskedTitle = maskText(post.title);
    const maskedAuthor = maskText(post.author);
    const maskedSubreddit = maskText(post.subreddit);
    const maskedTimestamp = maskText(new Date(post.timestamp).toLocaleString());
    const maskedUpvotes = maskText(post.upvotes.toString());
    const maskedPotentialSubreddits = maskText(post.potential_subreddits.join(", "));
    const maskedContent = maskText(post.content);

    const potentialSubreddits = post.potential_subreddits.join(", ");

    postContainer.innerHTML = `
        <div class="post-header-container">
            <svg rpl="" class="ico-subreddit" fill="currentColor" height="48" style="color: #FF8717;" viewBox="0 0 20 20" width="48" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0ZM8.016 8.633a1.616 1.616 0 0 0-.2.806V13.5H5.931V6.172h1.8v.9h.039a3.009 3.009 0 0 1 1.018-.732 3.45 3.45 0 0 1 1.449-.284c.246-.003.491.02.732.068.158.024.309.08.444.164l-.759 1.832a2.09 2.09 0 0 0-1.093-.26c-.33-.01-.658.062-.954.208a1.422 1.422 0 0 0-.591.565Zm2.9 6.918H9.355L14.7 2.633c.426.272.828.58 1.2.922l-4.984 11.996Z"></path>
            </svg>
            <div class="post-header-text">
                <p class="subreddit-name p-post-header">r/${maskedSubreddit}</p>
                <p class="Author p-post-header">${maskedAuthor}</p>
            </div>
        </div>
        <div class"post-middle-container">
            <h2 class="post-title">${maskedTitle}</h2>
            <p class="post-content">${maskedContent}</p>
        </div>   
        <div class="post-footer-container">
            <div class="post-upvotes">
                <svg rpl="" style="padding:8px" fill="currentColor" height="16" icon-name="upvote-outline" style="padding:16px" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <path d="M10 19c-.072 0-.145 0-.218-.006A4.1 4.1 0 0 1 6 14.816V11H2.862a1.751 1.751 0 0 1-1.234-2.993L9.41.28a.836.836 0 0 1 1.18 0l7.782 7.727A1.751 1.751 0 0 1 17.139 11H14v3.882a4.134 4.134 0 0 1-.854 2.592A3.99 3.99 0 0 1 10 19Zm0-17.193L2.685 9.071a.251.251 0 0 0 .177.429H7.5v5.316A2.63 2.63 0 0 0 9.864 17.5a2.441 2.441 0 0 0 1.856-.682A2.478 2.478 0 0 0 12.5 15V9.5h4.639a.25.25 0 0 0 .176-.429L10 1.807Z"></path> </svg>
                ${post.upvotes}
                <svg rpl="" style="padding:8px" fill="currentColor" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <path d="M10 1c.072 0 .145 0 .218.006A4.1 4.1 0 0 1 14 5.184V9h3.138a1.751 1.751 0 0 1 1.234 2.993L10.59 19.72a.836.836 0 0 1-1.18 0l-7.782-7.727A1.751 1.751 0 0 1 2.861 9H6V5.118a4.134 4.134 0 0 1 .854-2.592A3.99 3.99 0 0 1 10 1Zm0 17.193 7.315-7.264a.251.251 0 0 0-.177-.429H12.5V5.184A2.631 2.631 0 0 0 10.136 2.5a2.441 2.441 0 0 0-1.856.682A2.478 2.478 0 0 0 7.5 5v5.5H2.861a.251.251 0 0 0-.176.429L10 18.193Z"></path> </svg>
            </div>
            <div class="post-comments">
                <svg rpl="" style="padding:8px; padding-left:14px " aria-hidden="true" class="icon-comment" fill="currentColor" height="16" icon-name="comment-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <path d="M10 19H1.871a.886.886 0 0 1-.798-.52.886.886 0 0 1 .158-.941L3.1 15.771A9 9 0 1 1 10 19Zm-6.549-1.5H10a7.5 7.5 0 1 0-5.323-2.219l.54.545L3.451 17.5Z"></path> </svg>
                ${post.comments}
            </div>
        </div>
    `;

    const input = document.getElementById("subreddit");
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            const word = this.value.trim().toLowerCase();
            if (word) {
                const subredditsList = post.potential_subreddits.map(sub => sub.toLowerCase());
                
                if (post.subreddit.toLowerCase() === word || 
                    (word.startsWith("r/") && post.subreddit.toLowerCase() === word.substring(2))) {
                    revealMatchingWords(word);
                    this.value = "";
                    showPopup(true,post);
                    return;
                }
    
                if (subredditsList.includes(word) || 
                    (word.startsWith("r/") && subredditsList.includes(word.substring(2)))) {
                    revealMatchingWords(word);
                    this.value = "";
                    showPopup(false,post);
                    return;
                }
                
                const exactFound = revealMatchingWords(word);
                
                if (!exactFound && semanticDictionary) {
                    const semanticFound = revealSemanticMatches(word);
                    if (semanticFound) {
                        this.value = "";
                        return;
                    }
                }
                
                this.value = "";
                
                if (!exactFound) {
                    const inputBox = document.querySelector(".input-box");
                    inputBox.classList.add("input-box-error");
                    const inputBox2 = document.querySelector(".input-area");
                    inputBox2.classList.add("input-box-error2");
                    setTimeout(() => {
                        inputBox.classList.remove("input-box-error");
                        inputBox2.classList.remove("input-box-error2");
                    }, 500);
                }
            }
        }
    });

    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            const popupWin = document.getElementById('popup-win');
            const popupHint = document.getElementById('popup-hint');
            
            if (popupWin.classList.contains('popup-win-visible')) {
                closePopup();
            } else if (popupHint.classList.contains('popup-win-visible')) {
                closeHintPopup();
            }
        });
    }
}

function maskText(text) {
    if (!text) return "";
    
    text = text.replace(/\n/g, "###NEWLINE###");
    
    let links = [];
    let linkIndex = 0;
    
    text = text.replace(/(https?:\/\/[^\s]+)/g, url => {
        const placeholder = `###LINK${linkIndex}###`;
        links.push(`<a href="${url}" target="_blank" class="post-link">${url}</a>`);
        linkIndex++;
        return placeholder;
    });
    
    let result = text.split(/(\s+|[,.!?;:()\[\]{}'"\/\\|<>-]|###NEWLINE###|###LINK\d+###)/g)
        .map(part => {
            const linkMatch = part.match(/###LINK(\d+)###/);
            if (linkMatch) {
                return links[parseInt(linkMatch[1])];
            }
            
            if (part === "###NEWLINE###") {
                return "<br>";  
            }
            
            if (part.trim() === "") {
                return part;
            }
            
            const maskedChars = part.split('').map(() => '_').join('');
            
            return `<span class="masked-word" data-word="${part.toLowerCase()}" data-original="${part}">${maskedChars}</span>`;
        }).join("");
    
    return result;
}

function revealMatchingWords(inputWord) {
    const maskedWords = document.querySelectorAll(".masked-word");
    let found = false;
    
    maskedWords.forEach(wordElement => {
        const word = wordElement.getAttribute("data-word").toLowerCase();
        if (word === inputWord.toLowerCase()) {
            const originalText = wordElement.getAttribute("data-original");
            
            const existingHint = wordElement.querySelector('.semantic-hint');
            if (existingHint) {
                wordElement.removeChild(existingHint);
            }
            
            wordElement.classList.remove('expanded-mask');
            
            wordElement.textContent = originalText;
            wordElement.classList.add("revealed");
            
            revealedWords.set(word, originalText);
            
            found = true;
        }
    });
    
    if (found) {
        updateSemanticHints();
        saveGameState(); 
    }
    
    return found;
}

function calculateSimilarity(word1, word2) {
    if (semanticDictionary) {
        if (semanticDictionary[word1]) {
            const relatedEntry = semanticDictionary[word1].find(entry => 
                entry && entry.length >= 2 && entry[0].toLowerCase() === word2.toLowerCase());
            
            if (relatedEntry) {
                return relatedEntry[1];
            }
        }
        
        if (semanticDictionary[word2]) {
            const relatedEntry = semanticDictionary[word2].find(entry => 
                entry && entry.length >= 2 && entry[0].toLowerCase() === word1.toLowerCase());
            
            if (relatedEntry) {
                return relatedEntry[1];
            }
        }
    }
    
    if (word1.length > 2 && word2.length > 2) {
        if (word1.substring(0, 3) === word2.substring(0, 3)) {
            return 0.8;
        }
        
        if (word1.length > 4 && word2.length > 4 && 
            word1.substring(word1.length - 3) === word2.substring(word2.length - 3)) {
            return 0.7;
        }
        
        if (word1.includes(word2) || word2.includes(word1)) {
            return 0.6;
        }
    }
    
    return 0;
}

function updateSemanticHints() {
    if (revealedWords.size === 0) return;
    
    const maskedWords = document.querySelectorAll(".masked-word:not(.revealed)");
    
    maskedWords.forEach(wordElement => {
        const word = wordElement.getAttribute("data-word").toLowerCase();
        let bestMatch = null;
        let highestSimilarity = 0.5;
        
        revealedWords.forEach((originalText, revealedWord) => {
            const similarity = calculateSimilarity(word, revealedWord);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = originalText;
            }
        });
        
        if (bestMatch) {
            const existingHint = wordElement.querySelector('.semantic-hint');
            if (existingHint) {
                wordElement.removeChild(existingHint);
            }
            
            adjustMaskSize(wordElement, bestMatch);
            
            const hintElement = document.createElement('span');
            hintElement.className = 'semantic-hint';
            hintElement.textContent = bestMatch;
            wordElement.appendChild(hintElement);
            
            wordSimilarities.set(wordElement, bestMatch);
        }
    });
}

function getSemanticRelations(word) {
    if (!semanticDictionary) return { direct: [], reverse: [] };
    
    word = word.toLowerCase();
    const relations = {
        direct: [],
        reverse: []  
    };
    
    if (semanticDictionary[word] && Array.isArray(semanticDictionary[word])) {
        relations.direct = semanticDictionary[word].filter(entry => 
            Array.isArray(entry) && entry.length >= 2
        );
    }
    
    for (const [key, similarWords] of Object.entries(semanticDictionary)) {
        if (!Array.isArray(similarWords)) continue;
        
        for (const entry of similarWords) {
            if (Array.isArray(entry) && entry.length >= 2 && entry[0].toLowerCase() === word) {
                relations.reverse.push({
                    word: key,
                    similarity: entry[1]
                });
                break; 
            }
        }
    }
    
    return relations;
}

function revealSemanticMatches(inputWord) {
    inputWord = inputWord.toLowerCase();
    let found = false;
    const maskedWords = document.querySelectorAll(".masked-word:not(.revealed)");
    
    Object.keys(semanticDictionary).forEach(key => {
        if (found) return;
        
        const entryList = semanticDictionary[key];
        if (!Array.isArray(entryList)) return;
        
        for (let i = 0; i < entryList.length; i++) {
            const entry = entryList[i];
            
            if (Array.isArray(entry) && entry.length >= 1) {
                const similarWord = String(entry[0]).toLowerCase().trim();
                
                if (similarWord === inputWord || 
                    (inputWord.length <= 4 && similarWord.includes(inputWord))) {
                    
                    const similarityScore = entry.length >= 2 ? entry[1] : 0.5;
                    
                    maskedWords.forEach(element => {
                        const maskedWord = element.getAttribute("data-word").toLowerCase();
                        if (maskedWord === key.toLowerCase()) {
                            applySemanticHint(element, inputWord);
                            found = true;
                        }
                    });
                    
                    if (found) break;
                }
            }
        }
    });
    
    if (found) {
        updateSemanticHints();
    }
    
    return found;
}

function applySemanticHint(element, hintWord) {
    const originalWord = element.getAttribute("data-original");
    const maskedWord = element.getAttribute("data-word");
    
    const existingHint = element.querySelector('.semantic-hint');
    if (existingHint) {
        element.removeChild(existingHint);
    }
    
    const hintElement = document.createElement('span');
    hintElement.className = 'semantic-hint';
    hintElement.textContent = hintWord;
    
    adjustMaskSize(element, hintWord);
    
    element.appendChild(hintElement);
    
    wordSimilarities.set(element, hintWord);
    saveGameState(); 
}

function adjustMaskSize(element, hintWord) {
    const currentMask = element.textContent;
    const originalWord = element.getAttribute("data-word");
    
    if (hintWord.length > currentMask.length -2) {
        const extraChars = hintWord.length - currentMask.length +2;
        
        element.textContent = currentMask + '_'.repeat(extraChars);
        element.classList.add('expanded-mask');
    }
}

function buttonPopupclick() {
    closePopup();
    visiblePost();
}

function closePopup() {
    const popupElement = document.getElementById('popup-win');
    const overlay = document.querySelector('.overlay');
    
    popupElement.style.opacity = '0';
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 50);
    
    setTimeout(() => {
        popupElement.classList.remove('popup-win-visible');
        popupElement.classList.add('popup-win-invisble');
    }, 300);
}

function showPopup(isExactMatch,post) {
    const popupElement = document.getElementById('popup-win');
    const overlay = document.querySelector('.overlay');
    const popupTitle = popupElement.querySelector('h2');
    const popupText = popupElement.querySelector('p');
    
    if (isExactMatch) {
        popupTitle.textContent = "Congratulations!";
        popupText.textContent = "You have guessed the subreddit correctly!";
    } else {
        popupTitle.textContent = "Good job!";
        popupText.textContent = `You found one of the related subreddits! The answer was: r/${post.subreddit}`;
    }
    
    popupElement.classList.remove('popup-win-invisble');
    popupElement.classList.add('popup-win-visible');
    overlay.classList.add('active');
    
    setTimeout(() => {
        popupElement.style.opacity = '1';
    }, 10);
    
    triggerConfetti();
}

function triggerConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, { 
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        
        confetti(Object.assign({}, defaults, { 
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
    }, 250);
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10000
    });
}

function visiblePost() {
    const maskedWords = document.querySelectorAll(".masked-word");
    maskedWords.forEach(wordElement => {
      const originalText = wordElement.getAttribute("data-original");
      wordElement.textContent = originalText;
      wordElement.classList.add("revealed");
    });
    
    document.querySelectorAll('.semantic-hint').forEach(hint => {
        hint.remove();
    });
    
    revealedWords.clear();
    wordSimilarities.clear();
}

function showHintPopup() {
    const popupElement = document.getElementById('popup-hint');
    const overlay = document.querySelector('.overlay');
    
    popupElement.classList.remove('popup-win-invisble');
    popupElement.classList.add('popup-win-visible');
    overlay.classList.add('active');
    
    setTimeout(() => {
        popupElement.style.opacity = '1';
    }, 10);
}

function closeHintPopup() {
    const popupElement = document.getElementById('popup-hint');
    const overlay = document.querySelector('.overlay');
    
    popupElement.style.opacity = '0';
    
    setTimeout(() => {
        popupElement.classList.remove('popup-win-visible');
        popupElement.classList.add('popup-win-invisble');
        
        overlay.classList.remove('active');
    }, 300);
}

function showHint(hintType, saveState = true) {
    if (!currentPost) return;
    
    const hintButtonContainer = document.querySelector(`.hint-button-${hintType}`);
    const flipCard = hintButtonContainer.querySelector('.hint-button-flip');
    const hintBack = flipCard.querySelector('.hint-back');
    
    let hintText = '';
    switch(hintType) {
        case 'community':
            hintText = `Community size: ~${currentPost.community_size.toLocaleString()} members`;
            break;
        case 'letters':
            const subreddit = currentPost.subreddit;
            hintText = `r/${subreddit[0]}${subreddit.slice(1, -1).replace(/./g, '__')}${subreddit[subreddit.length-1]}`;
            break;
        case 'category':
            hintText = `Category: ${currentPost.category}`;
            break;
    }
    
    hintBack.textContent = hintText;
    
    if (!flipCard.classList.contains('flipped')) {
        flipCard.classList.add('flipped');
    }
    
    usedHints.add(hintType);
    
    if (saveState) {
        saveGameState(); 
    }
}

(function checkDevvitAPI() {
    
    window.addEventListener('message', function devvitMessageListener(event) {
        if (event.data && event.data.type === 'devvitAPIReady') {
            initializeDevvitAPI(event.data.channel || null);
        }
    });
    
    function initializeDevvitAPI(channel) {
        window.devvitAPI = {
            sendMessage: function(message) {
                return new Promise((resolve, reject) => {
                    try {
                        const requestId = Math.random().toString(36).substring(2, 15);
                        
                        const responseTimeout = setTimeout(() => {
                            delete window.devvitCallbacks[requestId];
                            reject(new Error("DevvitAPI request timed out"));
                        }, 5000);
                        
                        if (!window.devvitCallbacks) window.devvitCallbacks = {};
                        window.devvitCallbacks[requestId] = {
                            resolve: (data) => {
                                clearTimeout(responseTimeout);
                                resolve(data);
                            },
                            reject: (err) => {
                                clearTimeout(responseTimeout);
                                reject(err);
                            }
                        };
                        
                        window.parent.postMessage({
                            type: 'devvitMessage',
                            requestId: requestId,
                            message: message
                        }, '*');
                        
                    } catch (err) {
                        console.error("Failed to send message:", err);
                        reject(err);
                    }
                });
            }
        };
        
        window.addEventListener('message', function(event) {
            if (event.data && event.data.requestId && window.devvitCallbacks && window.devvitCallbacks[event.data.requestId]) {
                const callback = window.devvitCallbacks[event.data.requestId];
                delete window.devvitCallbacks[event.data.requestId];
                
                if (event.data.error) {
                    callback.reject(event.data.error);
                } else {
                    callback.resolve(event.data.result);
                }
            }
        });
        
        
        userId = getUserId();
        if (currentPost) {
            loadGameState();
        } else {
        }
    }
    
    if (window.parent && window.parent !== window) {
        try {
            window.parent.postMessage({ type: 'devvitInit' }, '*');
            
            setTimeout(() => {
                if (!window.devvitAPI) {
                    initializeDevvitAPI();
                }
            }, 1000);
        } catch (error) {
            console.error("Failed to initialize devvitAPI:", error);
        }
    } else {
    }
})();


document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        saveGameState();
    } else if (document.visibilityState === 'visible') {
        loadGameState();
    }
});

function initializeAutoSave() {
    setInterval(() => {
        if (userId && gameId) {
            saveGameState();
        }
    }, 10000);
}
