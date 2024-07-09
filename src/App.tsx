import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

interface Character {
  name: string;
  image: string;
  gallery: string[];
  "combat style": string;
  affiliation: string;
}

type NestedCharacter = {
  data: Character[];
}

function App(): React.ReactElement {
  //全てのキャラクター一覧から名前を取得
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  useEffect(() => {
    const fetchAllCharacters = async () => {
      const apiUrl = 'https://demon-slayer-api.onrender.com/v1';
      const result = await axios.get(apiUrl);
      console.log('API Response result:', result.data);
      setAllCharacters(result.data);
    };

    fetchAllCharacters();
  }, []);

  //全てのキャラクター一覧から名前を取得したら、その名前でキャラクターの詳細を取得
  const [characters, setCharacters] = useState<NestedCharacter[]>([]);

  //ページネーション用
  const displayCount = 9 //1ページあたりの表示数、APIは40件なので、9件*4ページと残り4件の計5ページ
  const [page, setPage] = useState(1);
  const [smallerPagination, setSmallerPagination] = useState(0);
  const [largerPagination, setLargerPagination] = useState(displayCount);


  // let largerPagination = 4; //初期値
  // let smallerPagination = largerPagination - 4; //初期値
  const handleNext = async () => {
    console.log('hangleNext called') //デバッグ用
    const nextPage = page + 1;
    const newLargerPagination = nextPage*displayCount;
    const newSmallerPagination = newLargerPagination - displayCount;
    console.log('nextPage', nextPage);
    console.log('newLargerPagination', newLargerPagination);
    console.log('newSmallerPagination', newSmallerPagination);
    setLargerPagination(newLargerPagination);
    setSmallerPagination(newSmallerPagination);
    // await fetchCharacters();
    setPage(nextPage);
  }

  const handlePrev = async () => {
    console.log('hangleNext called') //デバッグ用
    const prevPage = page - 1;
    const newLargerPagination = prevPage*displayCount;
    const newSmallerPagination = newLargerPagination - displayCount;
    setLargerPagination(newLargerPagination);
    setSmallerPagination(newSmallerPagination);
    // await fetchCharacters();
    setPage(prevPage);
  }

  //データのフェッチが完了するまでLoading...を表示
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      // const characterPromises = allCharacters.slice(0, allCharacters.length).map(async (character) => {
      setLoading(true)
      const characterPromises = allCharacters.slice(smallerPagination, largerPagination).map(async (character) => {
        const allCharactersName = character.name.replace(" ", "_")
        console.log(`allCharactersName`, allCharactersName);
        const characterUrl = `https://demon-slayer-api.onrender.com/v1/${allCharactersName}`
        const resultCharacter = await axios.get(characterUrl);
        console.log('API Response resultCharacter:', resultCharacter.data);
        return resultCharacter.data;
      });
  
      const fetchedCharacters = await Promise.all(characterPromises);
      console.log('Fetched Characters', fetchedCharacters); //デバッグ用
      setCharacters(fetchedCharacters);
      setLoading(false);
    }
    if (allCharacters.length > 0) {
      fetchCharacters();
    }
  }, [allCharacters, page]);

  console.log('characters', characters); //デバッグ用

  return (
    <div className="container">
      <div className="header">
        <div className="header-container">
          <img src={`${process.env.PUBLIC_URL}/logo.jpg`} alt="logo" className="logo" />
        </div>
      </div>
      <main>
        <div className='cards-container'>
          {loading ? (
            <div>Now Loading... (take 1minute or more)</div>
          ) : (
           characters.map((character, index) => {
            console.log('Rendering character', character); //デバッグ用
            if (Array.isArray(character)) {
              const charData = character[0];
              const charName = charData.name.split(' ');
              const imgSrc = page > 2 //Muzanの2回目が18件目なので、3ページ目以降は2回目の画像を表示
              ? `${process.env.PUBLIC_URL}/${charName[0]}_profile_2.png`
              : `${process.env.PUBLIC_URL}/${charName[0]}_Anime_Profile.png`
              console.log('charName', `${process.env.PUBLIC_URL}/${charName[0]}_Anime_Profile.png`)
              console.log('dummyPng', `${process.env.PUBLIC_URL}/dummy.png`)
            return (
              <div key={index}>
                <div className='card'>
                  <img  
                  src={imgSrc}
                  onError = {(e) => {
                     e.currentTarget.src = `${process.env.PUBLIC_URL}/dummy.png`; 
                    }
                  }
                  alt="character"
                  className='card-image'
                  />  
                </div>
                <div className='card-content'>
                  <h3 className='card-title'> 
                    {charData.name ? charData.name : 'No name'}
                  </h3>
                  <p className='card-description'>
                    {charData["combat style"]}
                  </p>
                  <div className='card-footer'>
                    <span className="affiliation">
                      {charData.affiliation}
                    </span>
                  </div>
                </div>
              </div>
            );
          } else {
            console.error('Expected character to be an array, but got:', character);
            return null;
          }
           })
          )}
        </div>
        <div className="pager">
          <button disabled={page === 1} className="prev" onClick = {handlePrev}>Previous</button>
          <span className="page-number">{`${page}`}/4</span>
          <button disabled={displayCount > characters.length} className="next" onClick={handleNext}>Next</button>
        </div>
      </main>
    </div>
  );
}

export default App;
