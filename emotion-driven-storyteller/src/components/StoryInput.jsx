import React, { useState } from "react";
import "./StoryInput.css";

const StoryInput = () => {
  const [story, setStory] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [extractedInfo, setExtractedInfo] = useState({
    gender: "",
    name: "",
    phrases: [],
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      extractInformation(content);
    };

    reader.readAsText(file);
  };

  const generateStory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Send an empty JSON object if no data is required
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      //   setStory(data.story);
      //   extractInformation(data.story);
    } catch (error) {
      console.error("Error generating story:", error);
    }
  };

  const extractInformation = (text) => {
    // Basic extraction logic - you'll need to enhance this based on your requirements
    const words = text.split(" ");
    const extractedData = {
      gender: detectGender(text),
      name: detectName(text),
      phrases: extractKeyPhrases(text),
    };
    setExtractedInfo(extractedData);
  };

  const detectGender = (text) => {
    // Add your gender detection logic here
    return "detected gender";
  };

  const detectName = (text) => {
    // Add your name detection logic here
    return "detected name";
  };

  const extractKeyPhrases = (text) => {
    // Add your phrase extraction logic here
    return ["phrase 1", "phrase 2"];
  };

  const proceedToEmotionDetection = () => {
    // Handle the transition to emotion detection
    const dataToProcess = {
      text: fileContent || story,
      ...extractedInfo,
    };
    // Add your navigation or processing logic here
  };

  return (
    <div className="story-input-container">
      <h2>Story Input</h2>

      <div className="input-section">
        <h3>Upload Story File</h3>
        <input type="file" accept=".txt" onChange={handleFileUpload} />
      </div>

      <div className="input-section">
        <h3>Or Generate Story</h3>
        <button onClick={generateStory}>Generate Story</button>
      </div>

      {(fileContent || story) && (
        <div className="story-preview">
          <h3>Story Content:</h3>
          <p>{fileContent || story}</p>

          <div className="extracted-info">
            <h3>Extracted Information:</h3>
            <p>Gender: {extractedInfo.gender}</p>
            <p>Name: {extractedInfo.name}</p>
            <p>Key Phrases: {extractedInfo.phrases.join(", ")}</p>
          </div>

          <button
            onClick={proceedToEmotionDetection}
            className="proceed-button"
          >
            Proceed to Emotion Detection
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryInput;
