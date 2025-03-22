import React, { useState } from 'react';
import './StoryInput.css';

const StoryInput = () => {
    const [story, setStory] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [extractedInfo, setExtractedInfo] = useState({ characters: [] });
    const [isLoading, setIsLoading] = useState(false);

    const API_KEY = "AIzaSyAe67VaV2KyO2qxIrhqxyn7MdsVDQpLe44";  // Replace with your actual API key
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
    const generateStory = async () => {
        try {
            setIsLoading(true);

            const requestBody = {
                contents: [{
                    parts: [{ text: "Generate a short story with 2 characters. The story should have clear character interactions and emotions. Generate this story in a play/drama like script. For eg: Bob: [dialogue]. Alice: [dialogue]. Give me the story with proper formatting and not in a single line." }]
                }]
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            // Extract the generated story text
            const generatedStory = data.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated.";
            setStory(generatedStory);

            // Extract character details from the generated story
            await extractInformation(generatedStory);
        } catch (error) {
            console.error("Error generating story:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 📌 Extract Characters & Phrases
    const extractInformation = async (text) => {
        try {
            const requestBody = {
                contents: [{
                    parts: [{ 
                        text: `Analyze the following story and extract all characters with their gender and associated phrases/sentences. Return ONLY a JSON object without any markdown formatting or explanation, in this exact structure:
                        {"characters":[{"name":"character name","gender":"character gender","phrases":["associated phrase 1","associated phrase 2"]}]}
                        
                        Story: ${text}`
                    }]
                }]
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            
            // Clean the response text and parse JSON
            const cleanJson = analysisText.replace(/```json\n|\n```|```/g, '').trim();
            const analysis = JSON.parse(cleanJson);
            setExtractedInfo(analysis);
        } catch (error) {
            console.error('Error analyzing story:', error);
            setExtractedInfo({ characters: [] });
        }
    };

    // 📌 Proceed to Emotion Detection (Dummy Function)
    const proceedToEmotionDetection = () => {
        console.log("Proceeding to emotion detection with:", extractedInfo);
        alert("Proceeding to emotion detection...");
    };

    return (
        <div className="story-input-container">
            <h2>Story Input</h2>
            
            {/* File Upload Section */}
            <div className="input-section">
                <h3>Upload Story File</h3>
                <input 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Story Generation Section */}
            <div className="input-section">
                <h3>Or Generate Story</h3>
                <button 
                    onClick={generateStory}
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : 'Generate Story'}
                </button>
            </div>

            {/* Story Preview Section */}
            {(fileContent || story) && (
                <div className="story-preview">
                    <h3>Story Content:</h3>
                    <p>{fileContent || story}</p>
                    
                    {/* Extracted Character Info */}
                    <div className="extracted-info">
                        <h3>Character Analysis:</h3>
                        <pre>{JSON.stringify(extractedInfo, null, 2)}</pre>
                    </div>

                    {/* Proceed Button */}
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
