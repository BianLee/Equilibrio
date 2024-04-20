import pdfplumber
from transformers import pipeline
import pinecone

# Step 1: Extract text from PDF
with pdfplumber.open("training.pdf") as pdf:
    full_text = "\n".join([page.extract_text() for page in pdf.pages])

# Step 2: (Optional) Preprocess the text
# This is where you might clean or segment the text as needed

# Step 3: Convert text to vectors
embedder = pipeline('feature-extraction', model='bert-base-uncased')
vectors = embedder(full_text)

# Step 4: Store vectors in Pinecone
# Initialize Pinecone
pinecone.init(api_key='708bc631-623e-44ef-9d2e-b930d9e79f23', environment='us-west1-gcp')

# Create a Pinecone Index
index_name = "yoga-postures"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(index_name, dimension=len(vectors[0][0]))

index = pinecone.Index(index_name)

# Insert vectors into the index
index.upsert(vectors=[(str(i), vec[0]) for i, vec in enumerate(vectors)])

# Now you can perform queries against the index
