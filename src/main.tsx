import './createPost.js';

import { Devvit, useWebView } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  redditAPI: true, 
});

Devvit.addCustomPostType({
  name: 'GuessTheSubreddit',
  description: 'Interactive game home screen',
  height: 'regular',
  render: () => {
    const { mount: mountGame } = useWebView({
      url: 'game1.html',
      onMessage: (message) => {
        console.log("Message reçu du WebView (Game) :", message);
      },
    });

    const { mount: mountRules } = useWebView({
      url: 'rule.html',
      onMessage: (message) => {
        console.log("Message reçu du WebView (Rules) :", message);
      },
    });

    return (
      <blocks>
        <zstack
          width="100%"
          height="100%"
          backgroundColor="#000000" 
          alignment="center middle"
        >
          <vstack
            backgroundColor="#0b1416"
            alignment="center middle"
            padding="large"
            cornerRadius="small"      
            borderWidth="thick"        
            borderColor="#324552"
          >
            <hstack alignment="center middle" gap="small">
              <text
                size="xxlarge"
                weight="bold"
                color="white"
              >
                GuessTheSubreddit
              </text>
              <image
                url="GuessTheSubreddit.png"
                imageWidth={25}
                imageHeight={25}
                resizeMode="fit"
                description="Logo GuessTheSubreddit"
              />
            </hstack>

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
                onPress={mountGame}
              >
                <text color="white" weight="bold" size="medium">
                  1️⃣ Daily challenge 1
                </text>
              </hstack>

              <hstack
                backgroundColor="#0045ac"
                cornerRadius="large"
                padding="small"
                minWidth="210px"
                alignment="center middle"
                onPress={mountRules}
              >
                <text color="white" weight="bold" size="medium">
                👨‍⚖️ Rules 📜 
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
