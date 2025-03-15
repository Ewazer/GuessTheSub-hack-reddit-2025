import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Tape 3 mots vite !',
  description: 'Tapez les trois mots affichés le plus rapidement possible',
  render: () => {
    const { mount } = useWebView({
      url: 'page.html',
      onMessage: (message) => {
        console.log("Message reçu du WebView :", message);
      },
    });

    return (
    
    <blocks>
      <vstack alignment="center middle" height="100%" width="100%">
        <button 
          appearance="destructive" 
          onPress={mount}
        >
        🔍 GuessTheSubreddit 🔎
        </button>
      </vstack>
    </blocks>
    );
  },
});

export default Devvit;