console.log("DevvitAPI Ultra-Light Bridge v1.0");

(function() {
  window.devvitAPI = {
    sendMessage: function(message) {
      return new Promise((resolve, reject) => {
        if (message.type === 'saveGameState') {
          try {
            const localKey = `gts_game_${message.gameId}_${message.userId}`;
            localStorage.setItem(localKey, JSON.stringify(message.state));
            resolve({ success: true, fromLocalStorage: true });
            return;
          } catch (e) {
          }
        } else if (message.type === 'loadGameState') {
          try {
            const localKey = `gts_game_${message.gameId}_${message.userId}`;
            const savedData = localStorage.getItem(localKey);
            
            if (savedData) {
              resolve({ 
                state: JSON.parse(savedData),
                success: true, 
                fromLocalStorage: true 
              });
              return;
            }
          } catch (e) {
          }
        }
        
        resolve({ success: true, local: true });
      });
    }
  };
})();