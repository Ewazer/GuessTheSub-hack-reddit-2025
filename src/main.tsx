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
  render: (context) => {
    const redis = context.redis;

    const { mount: mountGame } = useWebView({
      url: 'game1.html',
      onMessage: async (message) => {
        try {
          if (message.type === 'loadGameState') {
            const { userId, gameId, _requestId } = message;
            if (userId && gameId) {
              const isDev = process.env.NODE_ENV === 'development';
              if (isDev) {
                return { _requestId, success: true, dev: true };
              }

              try {
                const key = `game:${gameId}:user:${userId}`;
                const savedState = await redis.get(key);
                return { 
                  _requestId, 
                  state: savedState ? JSON.parse(savedState) : null,
                  success: true 
                };
              } catch (error) {
                return { _requestId, error: error.message, success: false };
              }
            }
          } else if (message.type === 'saveGameState') {
            const { userId, gameId, state, _requestId } = message;
            if (userId && gameId && state) {
              const isDev = process.env.NODE_ENV === 'development';
              if (isDev) {
                return { _requestId, success: true, dev: true };
              }

              try {
                const key = `game:${gameId}:user:${userId}`;
                await redis.set(key, JSON.stringify(state));
                return { _requestId, success: true };
              } catch (error) {
                return { _requestId, error: error.message, success: false };
              }
            }
          }
          
          return message._requestId ? 
            { _requestId, success: false, error: "Unhandled message type" } : 
            null;
        } catch (error) {
          return message._requestId ? 
            { _requestId, success: false, error: error.message } : 
            null;
        }
      },
    });

    const { mount: mountRules } = useWebView({
      url: 'rule.html',
      onMessage: (message) => {
        console.log("Message from Rules WebView:", message);
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
