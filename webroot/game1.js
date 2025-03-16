window.onload = function () {
    loadPost();
    addEventListeners();
};

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

let currentPost = null;

function loadPost() {
    fetch("post.json")
        .then(response => response.json())
        .then(data => {
            currentPost = data;
            displayPost(data);
        })
        .catch(error => console.error("Error loading JSON:", error));
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
                <svg rpl="" style="padding:8px" fill="currentColor" height="16" icon-name="upvote-outline" style="padding:16px" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$842653974$--><!--?lit$842653974$--><path d="M10 19c-.072 0-.145 0-.218-.006A4.1 4.1 0 0 1 6 14.816V11H2.862a1.751 1.751 0 0 1-1.234-2.993L9.41.28a.836.836 0 0 1 1.18 0l7.782 7.727A1.751 1.751 0 0 1 17.139 11H14v3.882a4.134 4.134 0 0 1-.854 2.592A3.99 3.99 0 0 1 10 19Zm0-17.193L2.685 9.071a.251.251 0 0 0 .177.429H7.5v5.316A2.63 2.63 0 0 0 9.864 17.5a2.441 2.441 0 0 0 1.856-.682A2.478 2.478 0 0 0 12.5 15V9.5h4.639a.25.25 0 0 0 .176-.429L10 1.807Z"></path><!--?--> </svg>
                ${post.upvotes}
                <svg rpl="" style="padding:8px" fill="currentColor" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$842653974$--><!--?lit$842653974$--><path d="M10 1c.072 0 .145 0 .218.006A4.1 4.1 0 0 1 14 5.184V9h3.138a1.751 1.751 0 0 1 1.234 2.993L10.59 19.72a.836.836 0 0 1-1.18 0l-7.782-7.727A1.751 1.751 0 0 1 2.861 9H6V5.118a4.134 4.134 0 0 1 .854-2.592A3.99 3.99 0 0 1 10 1Zm0 17.193 7.315-7.264a.251.251 0 0 0-.177-.429H12.5V5.184A2.631 2.631 0 0 0 10.136 2.5a2.441 2.441 0 0 0-1.856.682A2.478 2.478 0 0 0 7.5 5v5.5H2.861a.251.251 0 0 0-.176.429L10 18.193Z"></path><!--?--> </svg>
            </div>
            <div class="post-comments">
                <svg rpl="" style="padding:8px; padding-left:14px " aria-hidden="true" class="icon-comment" fill="currentColor" height="16" icon-name="comment-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$842653974$--><!--?lit$842653974$--><path d="M10 19H1.871a.886.886 0 0 1-.798-.52.886.886 0 0 1 .158-.941L3.1 15.771A9 9 0 1 1 10 19Zm-6.549-1.5H10a7.5 7.5 0 1 0-5.323-2.219l.54.545L3.451 17.5Z"></path><!--?--> </svg>
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
                
                console.log(post.subreddit.toLowerCase());
                if (post.subreddit.toLowerCase() === word || 
                    (word.startsWith("r/") && post.subreddit.toLowerCase() === word.substring(2))) {
                    revealMatchingWords(word);
                    this.value = "";
                    showPopup();
                    return;
                }
    
                if (subredditsList.includes(word) || 
                    (word.startsWith("r/") && subredditsList.includes(word.substring(2)))) {
                    revealMatchingWords(word);
                    this.value = "";
                    showPopup();
                    return;
                }
                
                const found = revealMatchingWords(word);
                this.value = "";
                
                if (!found) {
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
            // Check which popup is visible and close it
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
            // return `${part}`;
        }).join("");
    
    return result;
}

function revealMatchingWords(inputWord) {
    const maskedWords = document.querySelectorAll(".masked-word");
    let found = false;
    
    maskedWords.forEach(wordElement => {
        const word = wordElement.getAttribute("data-word").toLowerCase();
        if (word === inputWord.toLowerCase()) {
            wordElement.classList.add("revealing");
            const originalText = wordElement.getAttribute("data-original");
            
            setTimeout(() => {
                wordElement.textContent = originalText;
                wordElement.classList.remove("revealing");
                wordElement.classList.add("revealed");
            }, 50);
            
            found = true;
        }
    });
    
    return found;
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

function showPopup() {
    const popupElement = document.getElementById('popup-win');
    const overlay = document.querySelector('.overlay');
    
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

function showHint(hintType) {
    if (!currentPost) return;
    
    const hintButtonContainer = document.querySelector(`.hint-button-${hintType}`);
    const flipCard = hintButtonContainer.querySelector('.hint-button-flip');
    const hintBack = hintButtonContainer.querySelector('.hint-back');
    
    let hintText = '';
    switch(hintType) {
        case 'community':
            hintText = `Community size: ~${currentPost.community_size.toLocaleString()} members`;
            break;
        case 'letters':
            const subreddit = currentPost.subreddit;
            hintText = `r/${subreddit[0]}${subreddit.slice(1, -1).replace(/./g, '_')}${subreddit[subreddit.length-1]}`;
            break;
        case 'category':
            hintText = `Category: ${currentPost.category}`;
            break;
    }
    
    hintBack.textContent = hintText;
    
    if (!flipCard.classList.contains('flipped')) {
        flipCard.classList.add('flipped');
    }
}
