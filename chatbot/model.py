import textwrap
import numpy as np
import pandas as pd

import google.generativeai as genai
import google.ai.generativelanguage as glm

# Used to securely store your API key
# from google.colab import userdata
# from IPython.display import Markdown

# globals
title = "The next generation of AI for developers and Google Workspace"
sample_text = ("Title: The next generation of AI for developers and Google Workspace"
    "\n"
    "Full article:\n"
    "\n"
    "Gemini API & Google AI Studio: An approachable way to explore and prototype with generative AI applications")


MODEL = 'models/embedding-001'
GOOGLE_API_KEY = "" # !! insert

genai.configure(api_key=GOOGLE_API_KEY)
embedding = genai.embed_content(model=MODEL,
                                content=sample_text,
                                task_type="retrieval_document",
                                title=title)

DOCUMENT1 = {
    "title": "Chair",
    "content": "Instructions: ❖ stand with the feet together and the arms by the sides ❖ inhale, raise the arms over the head ❖ exhale, bend the knees and lower the trunk ❖ do not stoop forward, but keep the chest as far back as possible and breathe normally ❖ keep your back straight and hold the pose for 5 breaths ❖ inhale, straighten the legs, ❖ exhale, lower the arms and come back to standing pose Precautions: People suffering from serious back conditions should avoid this posture Benefits: ❖ removing stiffness in the shoulders ❖ the ankles become strong and the leg muscles develop evenly ❖ the diaphragm is lifted up and this gives a gentle massage to the heart ❖ the abdominal organs and the back are toned and the chest is developed by being fully expanded"
}
DOCUMENT2 = {
    "title": "Cobra",
    "content": "Instructions: ❖ lie flat on the stomach with the chin resting on the floor, the legs straight, feet together, and the soles of the feet uppermost ❖ place the palms next to your ears ❖ inhale, slide the chest forward and raise first the head, the shoulders, then, straightening the elbows, arch the back ❖ this will lower the hips and the buttocks to the floor ❖ bend the head to the back and look upward ❖ hold the pose for 5 breaths ❖ exhale, slowly bend the elbows, lower the chest and chin on the floor Precautions: People suffering from peptic ulcer, hernia, intestinal tuberculosis or hyperthyroidism should not practice this asana without consulting it with a doctor Benefits: ❖ removing backache, keeping the spine flexible ❖ alleviating constipation and is beneficial for all abdominal organs, especially the liver and kidneys ❖ strengthening the spine, chest, abdomen, shoulders ❖ firming the buttocks ❖ opening heart and lungs"
}
DOCUMENT3 = {
    "title": "Dog",
    "content": "Instructions: ❖ assume the starting position for Cat Stretch and look forward ❖ inhale, raise your hips up and lower the head between the arms so that the back and legs form two sides of a triangle ❖ keep the knees and hands straight, gaze on the floor ❖ push the heels and head towards the floor ❖ hold the pose for 5 breaths ❖ release the pose, relax in the Childʼs Pose Precautions: People with diarrhea, headache, high blood pressure or carpel tunnel syndrome should not practice this posture Benefits: ❖ calming the brain and relieving stress ❖ energizing the body ❖ stretching the arms, shoulders, hamstrings and calfs ❖ slimming effect on arms and legs ❖ improving digestion, relieving headache, insomnia, back pain and fatigue"
}
DOCUMENT4 = {
    "title": "Tree",
    "content": "Instructions: ❖ stand with the feet together and the arms by the sides ❖ steady the body and distribute the weight equally on both feet ❖ raise your left leg, bend the knee and place the sole on the inner side of your right thigh ❖ fix the eyes at one point and find the balance ❖ inhale, raise the arms over the head, bring the palms together and stretch the arms, shoulders and chest upward ❖ stretch the whole body from top to bottom, without losing balance or moving the feet ❖ hold the position for 5 breaths ❖ exhale slowly release the arms and left leg down to the starting position ❖ repeat on the other side Precautions: Be careful with the ankles, warm it up before the practice Benefits: ❖ developing physical and mental balance ❖ stretching the abdominal muscles and the intestines, helping to keep the abdominal muscles and nerves toned ❖ improving the posture"
}
DOCUMENT5 = {
    "title": "Warrior",
    "content": "Instructions: ❖ stand straight with legs together ❖ step forward with your left leg, turn your right foot to 45 degrees ❖ bring your both palms together on your knee, bend your knee so that thigh is parallel to the floor ❖ inhale, raise your both hands up, stretch the spine and gaze forward ❖ the bent knee should not extend beyond the ankle but should be in line with heel ❖ hold the pose for 5 long breaths ❖ exhale and release your hands down, go back to the starting pose ❖ repeat on the right side Precautions: People with weak heart and lower back problems should not practice this posture Benefits: ❖ it relieves stiffness in shoulders and back, tones up the ankles and knees and cures stiffness of he neck ❖ it reduces fat around the hips ❖ it helps in deep breathing"
}
documents = [DOCUMENT1, DOCUMENT2, DOCUMENT3, DOCUMENT4, DOCUMENT5]

df = pd.DataFrame(documents)
df.columns = ['Title', 'Text']


# Get the embeddings of each text and add to an embeddings column in the dataframe
def embed_fn(title, text):
  return genai.embed_content(model=MODEL,
                             content=text,
                             task_type="retrieval_document",
                             title=title)["embedding"]

df['Embeddings'] = df.apply(lambda row: embed_fn(row['Title'], row['Text']), axis=1)

def find_best_passage(query, dataframe):
  """
  Compute the distances between the query and each document in the dataframe
  using the dot product.
  """
  query_embedding = genai.embed_content(model=MODEL,
                                        content=query,
                                        task_type="retrieval_query")
  dot_products = np.dot(np.stack(dataframe['Embeddings']), query_embedding["embedding"])
  idx = np.argmax(dot_products)
  return dataframe.iloc[idx]['Text'] # Return text from index with max value


def make_prompt(query, relevant_passage):
  escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
  prompt = textwrap.dedent("""You are a helpful and informative bot that answers questions using text from the reference passage included below. \
  Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. \
  However, you are talking to a non-technical audience, so be sure to break down complicated concepts and \
  strike a friendly and converstional tone. \
  If the passage is irrelevant to the answer, you may ignore it.
  QUESTION: '{query}'
  PASSAGE: '{relevant_passage}'
  ANSWER:
  """).format(query=query, relevant_passage=escaped)

  return prompt


def predict(query: str) -> str:
  request = genai.embed_content(model=MODEL,
                              content=query,
                              task_type="retrieval_query")
  passage = find_best_passage(query, df)
  prompt = make_prompt(query, passage)
  model = genai.GenerativeModel('models/gemini-pro')
  answer = model.generate_content(prompt)
  # print(answer.text)
  return answer.text


