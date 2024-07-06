import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';

interface Character {
  name: string;
  image: string;
  id: number;
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched.current) {
        try {
          await fetchCharacters();
          hasFetched.current = true;
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }
    }
    fetchData();
  }, []);

  const fetchCharacters = async () => {
    const apiUrl = 'https://demon-slayer-api.onrender.com/v1?limit=5';

    try {
      const result = await axios.get(apiUrl);
      console.log('API Response:', result.data);
      setCharacters(result.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  }
  return (
    <div className="container">
      <main>
        <div className='cards-container'>
          {characters.map((character: Character, index: number) => {
            const encodedImageUrl = encodeURI(character.image);
            console.log('Character:', character); // キャラクター情報をログに出力
            console.log('Character Image:', encodedImageUrl); // 画像URLをログに出力
            return <div className='card' key={index}>
              <img 
              src={character.image} 
              alt="character"
              className='card-image'
              onError= {(e) => { 
                console.error('Image load error', e);// 画像読み込みエラーをログに出力
                e.currentTarget.src = 'logo.jpg';
              }} 
              />  
            </div>;
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
