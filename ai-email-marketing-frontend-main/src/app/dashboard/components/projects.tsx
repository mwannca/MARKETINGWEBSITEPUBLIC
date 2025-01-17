'use client';

import React, { useEffect, useState } from 'react';
import { EditorSession } from '../../../../types/types';
import { fetchEditSessions } from '../actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Projects.module.css';
import { AiOutlineFileText } from 'react-icons/ai'; // Import the module

export default function Projects() {
  const [sessions, setSessions] = useState<null | Array<EditorSession>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5); // Default to 5 items per page
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search input
  const [filteredSessions, setFilteredSessions] = useState<null | Array<EditorSession>>(null); // Filtered data
  const [suggestions, setSuggestions] = useState<Array<string>>([]); // State for autocomplete suggestions
  const router = useRouter();

  const fetchData = async () => {
    const data: Array<EditorSession> = await fetchEditSessions();
    setSessions(data);
    setFilteredSessions(data); // Initially, filtered sessions will be the same as sessions
  };

  const route = (session: EditorSession) => {
    setLoading(true);
    router.push(`/editor?session=${session.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Autocomplete suggestions based on search input
  useEffect(() => {
    if (sessions) {
      const filteredSuggestions = sessions
          .map(session => session.session_name)
          .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
      setSuggestions(filteredSuggestions);
    }
  }, [searchTerm, sessions]);

  // Handle search and filter sessions based on input
  const handleSearch = () => {
    if (sessions) {
      const filtered = sessions.filter(session =>
          session.session_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSessions(filtered);
      setCurrentPage(1); // Reset to the first page after search
    }
  };

  // Calculate total pages based on items per page
  const totalPages = filteredSessions
      ? Math.ceil(filteredSessions.length / itemsPerPage)
      : 1;

  // Paginate the filtered sessions data
  const currentSessions = filteredSessions?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (numItems: number) => {
    setItemsPerPage(numItems);
    setCurrentPage(1); // Reset to first page
  };

  return (
      <div className={styles.container}>
        <div className="flex justify-between mb-4">
          <div className="relative"  style={{marginLeft:'2em'}}>
            <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search projects or templates"
                className=" px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring focus:border-lime-400"
                list="suggestions"
            />
            <datalist id="suggestions">
              {suggestions.map((suggestion, index) => (
                  <option key={index} value={suggestion} />
              ))}
            </datalist>
            <button
                onClick={handleSearch}
                className="ml-2 px-4 py-2 rounded-md bg-lime-400 text-black hover:bg-lime-500 transition-all"
            >
              Search
            </button>
          </div>

          <div className="flex gap-2 mr-2">
            <button
                onClick={() => handleItemsPerPageChange(5)}
                className="transition-opacity duration-300 rounded-xl bg-gradient-to-bl from-lime-400 to-green-500 cursor-pointer hover:opacity-50 h-[50px] w-[100px]"
            >
              5 per page
            </button>
            <button
                onClick={() => handleItemsPerPageChange(10)}
                className="transition-opacity duration-300 rounded-xl bg-gradient-to-bl from-lime-400 to-green-500 cursor-pointer hover:opacity-50 h-[50px] w-[100px]"
            >
              10 per page
            </button>
            <button
                onClick={() => handleItemsPerPageChange(20)}
                className="transition-opacity duration-300 rounded-xl bg-gradient-to-bl from-lime-400 to-green-500 cursor-pointer hover:opacity-50 h-[50px] w-[100px]"
            >
              20 per page
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {currentSessions?.map((session, index) => (
              <div
                  key={index}
                  className={styles.projectCard}
                  onClick={() => route(session)}
              >
                <div className="m-8">
                  <div className="h-[200px] w-[200px] overflow-hidden flex flex-col justify-center items-center">
                    {session.preview_image_src ? (
                        <Image
                            src={session.preview_image_src}
                            alt=""
                            height={200}
                            width={200}
                            unoptimized
                        />
                    ) : (
                        <>
                          <AiOutlineFileText className="text-gray-500 text-8xl" />
                          <p className="mt-2 text-sm text-gray-400">
                            Draft – No preview available
                          </p>
                        </>
                    )}
                  </div>
                  <h1 className={styles.projectTitle}>{session.session_name}</h1>
                  <h1 className="text-[9px] text-zinc-300">
                    Last Saved:{' '}
                    {session.email_saves[session.email_saves.length - 1]
                        ?.updated_at || ''}
                  </h1>
                </div>
              </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{ padding: '8px 16px', marginLeft: '1em' }}
                  className={`transition-opacity duration-300 rounded-xl h-[50px] w-[40px] cursor-pointer 
            ${currentPage === page
                      ? 'bg-gradient-to-r from-green-500 to-lime-400 opacity-100 border border-white font-bold'
                      : 'bg-gradient-to-bl from-lime-400 to-green-500 hover:opacity-50'
                  }`}
              >
                {page}
              </button>
          ))}
        </div>
      </div>
  );
}
