import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'GuessTheSubreddit',
  description: 'Interactive game home screen',
  height: 'regular',
  render: () => {
    const { mount } = useWebView({
      url: 'game1.html',
      onMessage: (message) => {
        console.log("Message reçu du WebView :", message);
      },
    });
    return (
      <blocks>
        <zstack
          width="100%"
          height="100%"
          backgroundColor="#0b1416"
          alignment="center middle"
        >
          <vstack
            alignment="center middle"
            padding="large"
            cornerRadius="small"      
            borderWidth="thick"        
            borderColor="#232b2d"
          >
            <text
              size="xxlarge"
              weight="bold"
              color="white"
            >
              GuessTheSubreddit
            </text>

            
            <text color="white" style="body" wrap>
              Guess the subreddit !!!
            </text>

            <vstack gap="medium" padding="medium" alignment="center middle">
              <hstack 
                backgroundColor="#bc0117"
                cornerRadius="large"   
                padding="small"
                minWidth="210px"  
                alignment="center middle"
                onPress={mount}
              >
                <text color="white" weight="bold" size="medium">
                  1️⃣ Dailly challenge 1
                </text>
              </hstack>

              <hstack
                backgroundColor="#bc0117"
                cornerRadius="large"
                padding="small"
                minWidth="210px"
                alignment="center middle"
                onPress={() => {
                  console.log('Daily challenge 2 clicked!');
                }}
              >
                <text color="white" weight="bold" size="medium">
                  2️⃣ Dailly challenge 2
                </text>
              </hstack>

              <hstack
                backgroundColor="#bc0117"
                cornerRadius="large"
                padding="small"
                minWidth="210px"
                alignment="center middle"
                onPress={() => {
                  console.log('Daily challenge 3 clicked!');
                }}
              >
                <text color="white" weight="bold" size="medium">
                  3️⃣ Dailly challenge 3
                </text>
              </hstack>
            </vstack>
          </vstack>
        </zstack>
      </blocks>
    );
  },
});
export default Devvit;
