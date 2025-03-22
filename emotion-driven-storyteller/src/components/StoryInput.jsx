import React, { useState } from "react";

const StoryInput = () => {
  const [story, setStory] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [extractedInfo, setExtractedInfo] = useState({ dialogues: [] });
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = "AIzaSyAe67VaV2KyO2qxIrhqxyn7MdsVDQpLe44"; // Replace with your actual API key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  // 📌 Handle File Upload
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

  // 📌 Generate Story using Gemini API
  // Format story text by removing stars and formatting scene narrations
  const formatStoryText = (text) => {
    // Remove standalone stars
    let formattedText = text.replace(/^\s*\*+\s*$/gm, "");

    // Format scene titles and settings
    formattedText = formattedText.replace(/^\*{2}([^*]+)\*{2}$/gm, "$1");

    // Remove extra newlines
    formattedText = formattedText.replace(/\n{3,}/g, "\n\n");

    return formattedText.trim();
  };

  const generateStory = async () => {
    try {
      setIsLoading(true);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Generate a short story with 2 characters and a narrator. The story should have clear character interactions, emotions, and narrative descriptions. Generate this story in a play/drama-like script format where character dialogues are marked as 'Character Name: [dialogue]' and narrative descriptions are marked as 'Narrator: [description]'. Include narrative descriptions between dialogues to set scenes and describe actions. Ensure proper formatting with each entry on a new line.",
              },
            ],
          },
        ],
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Extract and format the generated story text
      const rawStory =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No story generated.";
      const formattedStory = formatStoryText(rawStory);
      setStory(formattedStory);

      // Extract character details from the formatted story
      await extractInformation(formattedStory);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Extract Characters & Dialogues (Without Gender Field)
  const extractInformation = async (text) => {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analyze the following story and extract all dialogues and narrative descriptions in the order they appear. 
                        Return ONLY a JSON array where each entry represents either a character's dialogue or a narrator's description. 
                        Use this exact JSON format:
                        
                        {"dialogues": [
                            {"id": 1, "name": "Speaker Name", "dialogue": "Spoken dialogue"},
                            {"id": 2, "name": "Narrator", "dialogue": "Narrative description or scene setting"},
                            {"id": 3, "name": "Next Speaker", "dialogue": "Next spoken dialogue"}
                        ]}
                        
                        Treat narrative descriptions as dialogues with "Narrator" as the speaker name. Do not include gender information.
                        Do NOT return any explanations, markdown formatting, or additional text.

                        Story: ${text}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Clean the response and parse JSON
      const cleanJson = analysisText.replace(/```json\n|\n```|```/g, "").trim();
      const analysis = JSON.parse(cleanJson);
      setExtractedInfo(analysis);
    } catch (error) {
      console.error("Error analyzing story:", error);
      setExtractedInfo({ dialogues: [] });
    }
  };

  // 📌 Proceed to Emotion Detection (Dummy Function)
  const proceedToEmotionDetection = () => {
    console.log("Proceeding to emotion detection with:", extractedInfo);
    alert("Proceeding to emotion detection...");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <h2 className="text-4xl font-bold text-primary-300 mb-8 animate-slide-up">
        Story Input
      </h2>

      {/* File Upload Section */}
      <div className="card flex flex-col items-center justify-center">
        <h3 className="text-2xl font-semibold text-primary-200 mb-4 text-center">
          Upload Story File
        </h3>
        <label className="block w-full max-w-md text-center">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="input-field w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer text-center"
          />
        </label>
      </div>

      {/* Story Generation Section */}
      <div className="card">
        <h3 className="text-2xl font-semibold text-primary-200 mb-4">
          Or Generate Story
        </h3>
        <button
          onClick={generateStory}
          disabled={isLoading}
          className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Story"
          )}
        </button>
      </div>

      {/* Story Preview Section */}
      {(fileContent || story) && (
        <div className="space-y-6 animate-slide-up">
          <div className="card">
            <h3 className="text-2xl font-semibold text-primary-200 mb-4">
              Story Content
            </h3>
            <div className="text-gray-300 text-left font-mono space-y-4">
              {extractedInfo.dialogues.map((entry, index) => (
                <div key={index} className="flex items-start space-x-4 mb-2">
                  {entry.name === "Narrator" ? (
                    <div className="flex-grow italic">[{entry.dialogue}]</div>
                  ) : (
                    <>
                      <div className="w-24 flex-shrink-0 font-bold text-blue-400">
                        {entry.name}:
                      </div>
                      <div className="flex-grow">{entry.dialogue}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Character Info */}
          <div className="card">
            <h3 className="text-2xl font-semibold text-primary-200 mb-4">
              Extracted Dialogues
            </h3>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
              {JSON.stringify(extractedInfo, null, 2)}
            </pre>
          </div>

          {/* Proceed Button */}
          <button
            onClick={proceedToEmotionDetection}
            className="btn-primary w-full md:w-auto mx-auto block mt-8 text-lg animate-pulse-slow"
          >
            Proceed to Emotion Detection
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryInput;
