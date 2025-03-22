import React from 'react';
import './App.css';
import StoryInput from './components/StoryInput';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Emotion Driven Storytelling</h1>
      </header>
      <main>
        <StoryInput />
      </main>
    </div>
  );
}

export default App;