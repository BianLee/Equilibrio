Experience the future of fitness— optimize your yoga and pilates sessions at home or on-the-go with Equilibrio, where your progress is our priority. 

# Inspiration
In the rapidly evolving fitness landscape, many enthusiasts face challenges in accessing affordable, professional guidance for yoga and pilates. These disciplines, while immensely beneficial for both physical and mental health, demand precise technique to prevent injuries and maximize benefits. The high costs and limited availability of expert trainers often discourage regular practice. Additionally, improper form during home workouts can expose enthusiasts to injuries and hinder their fitness progress.

The recent surge in remote and home workouts has not only shaped the market but has personally impacted our team. Like many of our users, we've experienced the limitations and frustrations of trying to perfect our practice at home. This firsthand understanding fuels our mission at Equilibrio, driving us to meet the growing demand for an interactive, personal training experience that delivers the precision and support of a live coach.


# What it does
Welcome to Equilibr.io, your ultimate companion for mastering the art of yoga and pilates. Our innovative web app revolutionizes your practice by offering real-time form correction and live, personalized coaching, transforming home workouts into professional-level sessions, ensuring you perform every pose safely and effectively. Whether you're a beginner looking to learn the basics or an advanced practitioner aiming to perfect your technique, our app adapts to meet your needs.

With Equilibrio, you're never practicing alone. We also provide a live chat feature that connects you directly with a knowledgeable AI agent that provides personalized workout routines and advice tailored just for you. This one-on-one guidance helps you make the most out of your practice, avoid injuries, and achieve your fitness goals faster.


# How we built it
For the pose classification part of this project, we utilized Tensorflow’s PoseNet API to detect users’ movement position based on their webcam feed. We then processed a large dataset of yoga poses using a large language model, repositioning every body part coordinate relative to the nose position, and trained a model to compare this raw data to user inputted data. Then, we input this into a language model to generate live feedback in real time. 

Our chatbot feature also uses LLMs, specifically the Google Gemini API, to provide exercise suggestions and routines for users based on their needs. We trained our Gemini model on documents containing different yoga and pilates poses and their health benefits and targets so that it will provide the best and most accurate advice possible. 

We also implemented a text-to-speech feature in our chat using ElevenLabs, so that users can hear their feedback live while they are doing their exercises, instead of having to input information on their device. 


# Challenges we ran into
As none of our team members has had extensive experience working with ML/AI, we found it difficult to start on the central process of our app, the live motion feedback. The most difficult process of our entire coding process was integrating the trained machine learning models with our frontend. We ran into several errors along the way, including timed out API call requests, faulty or missing training data, and overall difficulty with implementing the backend. 


# Accomplishments we’re proud of
Despite our setbacks, we were able to put together a working full-stack project that encompasses our main goal: to improve the lives of people through helping them find their balance and perfect form while staying fit. 


# What’s next for Equilibrio
Looking ahead, Equilibrio is committed to enhancing user experience through several key developments, including expanding device compatibility, increasing pose library, and developing offline capabilities so that our app is accessible and helpful to everyone. 
