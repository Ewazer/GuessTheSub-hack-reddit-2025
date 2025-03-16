window.onload = function () {
    loadPost();
};

function loadPost() {
    fetch("post.json")
        .then(response => response.json())
        .then(data => {
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
                    const popupElement = document.getElementById('popup-win');
                    popupElement.classList.remove('popup-win-invisble');
                    popupElement.classList.add('popup-win-visible');
                    return;
                }

                if (subredditsList.includes(word) || 
                    (word.startsWith("r/") && subredditsList.includes(word.substring(2)))) {
                    revealMatchingWords(word);
                    this.value = "";
                    const popupElement = document.getElementById('popup-win');
                    popupElement.classList.remove('popup-win-invisble');
                    popupElement.classList.add('popup-win-visible');
                    return;
                }
                
                revealMatchingWords(word);
                this.value = "";
            }
        }
    });
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
    closePopup()
    visiblePost();
}

function closePopup() {
    const popupElement = document.getElementById('popup-win');
    popupElement.classList.remove('popup-win-visible');
    popupElement.classList.add('popup-win-invisble');
}

function visiblePost() {
    const maskedWords = document.querySelectorAll(".masked-word");
    maskedWords.forEach(wordElement => {
      const originalText = wordElement.getAttribute("data-original");
      wordElement.textContent = originalText;
      wordElement.classList.add("revealed");
    });
  }
