import './MediaSearch.css';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import environment from './environment';
import { useNavigate, useSearchParams } from "react-router-dom";
import MediaGridItem from './MediaGridItem';

const MediaSearch = () => {
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedia, setFilteredMedia] = useState([]);
  const inputRef = useRef(null);
  const filteredMediaRef = useRef([]);
  let [, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(environment.media_collection_url);
        const data = await response.json();
        setMedia(data.media);
        setFilteredMedia(data.media);
      } catch (error) {
        console.error('Error fetching the media:', error);
      }
    };

    fetchMedia();
  }, []);

  const filterMedia = useCallback(() => {
    const results = media
      .filter(item => {
        const { name, tags, collection } = item;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
          (name && name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (tags && tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))) ||
          (collection && collection.toLowerCase().includes(lowerCaseSearchTerm))
        );
      })
    ;

    const uniqueResults = results.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.key === value.key
      ))
    );

    const sortedResults = uniqueResults
      .sort((a, b) => {
        const an = a.name || '';
        const bn = b.name || '';

        return bn.localeCompare(an);
      })
      .sort((a, b) => {
        const an = a.collection || '';
        const bn = b.collection || '';

        return an.localeCompare(bn);
      })
      .sort((a, b) => {
        const ad = new Date(a.created_at || 0);
        const bd = new Date(b.created_at || 0);

        return bd - ad;
      })
      .sort((a, b) => {
        const ar = a.rating || -1;
        const br = b.rating || -1;

        return br - ar;
      })
    ;

    setFilteredMedia(sortedResults);
    setSearchParams({ searchTerm });
    filteredMediaRef.current = sortedResults;
  }, [searchTerm, media, setSearchParams]);

  useEffect(() => {
    filterMedia();
  }, [filterMedia]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inputRef.current) {
        if (e.key === 'Enter') {
          if (filteredMediaRef.current.length > 0) {
            navigate('/view?url=' + filteredMediaRef.current[0].url);
          }
        } else if (e.key === 'Escape') {
          setSearchTerm('');
        }


        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className='MediaSearch'>
      <br />
      <input
        type="text"
        ref={inputRef} 
        placeholder="Search by name, tags, or collection"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="media-grid">
        {filteredMedia.map((item, index) => (<MediaGridItem key={item.key} item={item} index={index} />))}
      </div>
    </div>
  );
};

export default MediaSearch;