import numpy as np
from openai import OpenAI
import re
import json
import nltk
from nltk.corpus import wordnet as wn
import time

nltk.download('wordnet')

client = OpenAI(api_key="my-key")

text = """SideProject I built a chrome extension that got 223 users in 6 days This is my second side project. With my first startup, I got sick of wasting hours on repetitive tasks like adding LinkedIn connections one by one, reviewing job applications, buying domains, setting up business emails, and other little tasks that eat up major time. So I built an AI agent that could handle all this crap for me, and I am looking for a genuine feedback from you. I wanted to keep it simple so it doesn't require any coding or environment setup like other AI agents. So far, the response has been like - 223 users in less than a week. I gave everyone 1000 free credits thinking it would last them a while. Almost everyone burned through them. Some SEO folks have been running tasks for 2+ hours straight. Current automations include bulk LinkedIn connections, scanning job applications for recruiters, bulk domain buying on GoDaddy, setting up business emails, and a bunch of stuff for email marketing, SEO, and recruiters. I've also added a way for creators to build and monetize their own workflows, though that feature isn't that intuitive to use as of now. I'd love for you to try it out and tell me what sucks, what's good, and what tasks I should automate next. Brutal honesty appreciated - I'm building this to solve real problems. You can check it out here: https://100x.bot/ (Only works on chrome)"""

words = re.findall(r'\b\w+\b', text.lower())
unique_words = set(words)

def enrich_words(word_list):
    enriched_words = set(word_list)  

    for word in word_list:
        for syn in wn.synsets(word):
            for lemma in syn.lemmas():
                enriched_words.add(lemma.name().lower().replace("_", " "))

            for hyper in syn.hypernyms():
                for lemma in hyper.lemmas():
                    enriched_words.add(lemma.name().lower().replace("_", " "))

            for hypo in syn.hyponyms():
                for lemma in hypo.lemmas():
                    enriched_words.add(lemma.name().lower().replace("_", " "))

    return list(enriched_words)

all_words = enrich_words(unique_words)
print("number of words :", len(all_words))

batch_size = 2000
word_batches = [all_words[i:i + batch_size] for i in range(0, len(all_words), batch_size)]

embeddings = {}

for batch in word_batches:
    response = client.embeddings.create(
        input=batch,
        model="text-embedding-3-small"
    )
    batch_embeddings = {word: np.array(item.embedding) for word, item in zip(batch, response.data)}
    embeddings.update(batch_embeddings)
    print("update embeddings")

def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

neighbors_index = {}
base_threshold = 0.60 

for word, vec1 in embeddings.items():
    neighbors = []
    for other_word, vec2 in embeddings.items():
        if word == other_word:
            continue
        sim = cosine_similarity(vec1, vec2)

        if sim >= base_threshold:
            neighbors.append((other_word, sim))

    neighbors.sort(key=lambda x: x[1], reverse=True)
    neighbors_index[word] = neighbors[:10] 

with open("dict.json", "w", encoding="utf-8") as f:
    json.dump(neighbors_index, f, indent=4, ensure_ascii=False)

# with open("dict.json", "r", encoding="utf-8") as f:
#     neighbors_index = json.load(f)


# def get_similar_words(word):
#     if word in semantic_dict:
#         neighbors = semantic_dict[word]
#         if neighbors:
#             print(f"word close to'{word}':")
#             for neighbor, similarity in neighbors:
#                 print(f"- {neighbor} (similarité: {similarity:.2f})")
#         else:
#             print(f"No word find '{word}'.")
#     else:
#         print(f" '{word}' xxx")

# # Exemple avec "assembly"
# get_similar_words("construct")
