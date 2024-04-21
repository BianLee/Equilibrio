// pages/api/generate-audio.js

import axios from "axios";

const options = {
  method: "POST",
  headers: {
    "xi-api-key": "6ec6a451d2ee80120d295ed14bd80e10",
    "Content-Type": "application/json",
  },
  body: '{"text":"<string>","model_id":"<string>","voice_settings":{"stability":123,"similarity_boost":123,"style":123,"use_speaker_boost":true},"pronunciation_dictionary_locators":[{"pronunciation_dictionary_id":"<string>","version_id":"<string>"}]}',
};

fetch("https://api.elevenlabs.io/v1/text-to-speech/{voice_id}", options)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
