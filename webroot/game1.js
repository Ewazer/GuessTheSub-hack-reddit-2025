<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🕵️‍♂️ GuessTheSubreddit</title>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body class="body_home">
    <div id="popup-win" class="popup-win-invisble">
      <div class="popup-content">
        <h2>Congratulations!</h2>
        <p>You have guessed the subreddit correctly!</p>
        <div class="button-popup-content">
          <button class="button-popup">Reveal All</button>
        </div>
      </div>
    </div>
    <div id="popup-hint" class="popup-win-invisble">
      <div class="popup-content">
        <h2>Hints</h2>
        <p>Choose a hint to help you guess:</p>
        <div class="hint-buttons">
          <div class="hint-button-container hint-button-community">
            <div class="hint-button-flip">
              <button class="button-hint">Community Size</button>
              <div class="hint-back"></div>
            </div>
          </div>
          
          <div class="hint-button-container hint-button-letters">
            <div class="hint-button-flip">
              <button class="button-hint">First/Last Letters</button>
              <div class="hint-back"></div>
            </div>
          </div>
          
          <div class="hint-button-container hint-button-category">
            <div class="hint-button-flip">
              <button class="button-hint">Category</button>
              <div class="hint-back"></div>
            </div>
          </div>
        </div>
        <div class="button-popup-content">
          <button class="button-popup2">Close</button>
        </div>
      </div>
    </div>
    <section class="top-page">
      <h1 class="title">GuessTheSubreddit</h1>
    </section>
    <section class="midd-page">
      <div class="input-and-top">
        <div class="find-content">
          <div class="input-box">
            <svg rpl="" class="loupe-search" aria-hidden="true" fill="currentColor" height="16" icon-name="search-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M18.916 17.717 15.2 14.042a8.043 8.043 0 1 0-1.053 1.069l3.709 3.672a.75.75 0 0 0 1.056-1.066h.004ZM2.5 9a6.5 6.5 0 1 1 11.229 4.446.695.695 0 0 0-.116.077.752.752 0 0 0-.086.132A6.492 6.492 0 0 1 2.5 9Z"></path></svg>
            <input class="input-area" type="text" id="subreddit" placeholder="Enter word"> 
          </div>
          <button class="button-indice">🆘 Indice</button>
        </div>
      </div>
      <div id="post-content"></div>
    </section>
    
  </body>
  <script src="game1.js"></script>
  <script src="confetti.js"></script>
</html>
