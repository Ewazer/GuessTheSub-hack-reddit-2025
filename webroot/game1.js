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
        <p><strong>Subreddit:</strong> ${maskedSubreddit}</p>
        <h2>${maskedTitle}</h2>
        <p><strong>Author:</strong> ${maskedAuthor}</p>
        <p><strong>Upvotes:</strong> ${maskedUpvotes}</p>
        <p><strong>Potential Subreddits:</strong> ${maskedPotentialSubreddits}</p>
        <p><strong>Content:</strong> ${maskedContent}</p>
    `;

    const input = document.getElementById("subreddit");
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            const word = this.value.trim().toLowerCase();
            if (word) {
                const subredditsList = post.potential_subreddits.map(sub => sub.toLowerCase());
                
                if (subredditsList.includes(word) || 
                    (word.startsWith("r/") && subredditsList.includes(word.substring(2)))) {
                    revealMatchingWords(word);
                    this.value = "";
                    console.log("win");
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
    
    return text.split(/(\s+|[,.!?;:()\[\]{}'"\/\\|<>-])/g)
        .map(part => {
            if (part.trim() === "") {
                return part; 
            }
            const maskedChars = part.split('').map(() => '_').join('');
            
            return `<span class="masked-word" data-word="${part.toLowerCase()}" data-original="${part}">${maskedChars}</span>`;
        }).join("");
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
