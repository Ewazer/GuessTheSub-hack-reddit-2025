import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  label: '🎯 Create a GuessTheSubreddit Challenge',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: '🕵️ Guess the subreddit from this hidden post!',
      subredditName: subreddit.name,
 
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading 🔎 ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Challenge created!' });
    ui.navigateTo(post);
  },
});
