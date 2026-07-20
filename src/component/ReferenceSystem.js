import React, { useState, createContext, useContext } from 'react';

// Context for managing references globally
const ReferenceContext = createContext();

// Provider component to wrap the entire article
export const ReferenceProvider = ({ children }) => {
  const [activeReference, setActiveReference] = useState(null);
  const [references, setReferences] = useState({});

  const addReference = React.useCallback((id, content) => {
    setReferences(prev => {
      if (prev[id] === content) return prev; // Prevent unnecessary updates
      return { ...prev, [id]: content };
    });
  }, []);

  return (
    <ReferenceContext.Provider value={{
      activeReference,
      setActiveReference,
      references,
      addReference
    }}>
      {children}
    </ReferenceContext.Provider>
  );
};

// Hook to use reference context
const useReference = () => {
  const context = useContext(ReferenceContext);
  if (!context) {
    throw new Error('useReference must be used within a ReferenceProvider');
  }
  return context;
};

// Citation component - renders the clickable number
export const Citation = ({ id, children }) => {
  const { addReference } = useReference();

  // Add reference content when component mounts
  React.useEffect(() => {
    if (children) {
      addReference(id, children);
    }
  }, [id, children, addReference]);

  const handleClick = () => {
    const element = document.getElementById(`reference-${id}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Briefly highlight the reference
      element.style.backgroundColor = '#f3f4f6';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
  };

  return (
    <sup 
      id={`citation-${id}`}
      className="text-black text-xs cursor-pointer hover:text-gray-600 transition-colors ml-1"
      onClick={handleClick}
    >
      {id}
    </sup>
  );
};

// References list component - displays all references at bottom of article
export const ReferencesList = () => {
  const { references } = useReference();

  const handleBackToText = (id) => {
    const element = document.getElementById(`citation-${id}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Briefly highlight the citation
      element.style.backgroundColor = '#f3f4f6';
      element.style.padding = '2px 4px';
      element.style.borderRadius = '3px';
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.padding = '';
        element.style.borderRadius = '';
      }, 2000);
    }
  };

  if (!references || Object.keys(references).length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      
      <div className="space-y-3">
        {Object.entries(references)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([id, content]) => (
            <div 
              key={id} 
              id={`reference-${id}`}
             className="flex items-start gap-3 transition-all duration-300 p-2 rounded-[10px] hover:bg-gray-100"
            >
              <button
                className="text-sm font-semibold text-black hover:text-gray-600 cursor-pointer mt-0.5 min-w-[20px] transition-colors"
                onClick={() => handleBackToText(id)}
                title="Go back to citation in text"
              >
                {id}.
              </button>
              <div className="text-sm text-gray-700 leading-relaxed">
                {content}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Example article component demonstrating usage
const ExampleArticle = () => {
  return (
    <ReferenceProvider>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Islamic Scholarship: Evolution and Methodology</h1>
        
        <div className="space-y-6 text-gray-800 leading-relaxed text-base">
          <p>
            The study of Islamic scholarship has evolved significantly over the centuries
            <Citation id="1">
              Ibn Khaldun, Al-Muqaddimah, Chapter 6: "The Sciences and the Ways of Learning Them"
            </Citation>
            , with various methodologies emerging to authenticate and classify religious texts.
          </p>

          <p>
            According to recent research, the classification system used by early scholars
            <Citation id="2">
              Muhammad Zubayr Siddiqi, "Hadith Literature: Its Origin, Development, and Special Features" (Cambridge: Islamic Texts Society, 1993), pp. 45-67
            </Citation>
            was more sophisticated than previously understood by modern academics.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 text-gray-900">Key Authentication Methods:</h3>
            <div className="ml-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  The authentication process involved multiple verification steps
                  <Citation id="3">
                    Al-Dhahabi, Mizan al-I'tidal fi Naqd al-Rijal, Volume 1, Introduction
                  </Citation>
                  , ensuring the reliability of transmitted knowledge.
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  Cross-referencing was systematically employed by classical scholars
                  <Citation id="4">
                    Ibn Hajar al-Asqalani, Tahdhib al-Tahdhib, methodology section
                  </Citation>
                  to verify the accuracy of historical accounts.
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  Regional variations in scholarly approaches were documented
                  <Citation id="5">
                    Jonathan A.C. Brown, "Hadith: Muhammad's Legacy in the Medieval and Modern World" (Oxford: Oneworld Publications, 2009), Chapter 4
                  </Citation>
                  , reflecting diverse intellectual traditions.
                </div>
              </div>
            </div>
          </div>

          <p>
            Contemporary scholars continue to debate these methodologies
            <Citation id="6">
              Wael B. Hallaq, "Islamic Legal Theories: An Introduction to Sunni Usul al-Fiqh" (Cambridge: Cambridge University Press, 1997), pp. 123-145
            </Citation>
            , seeking to understand their relevance in modern Islamic jurisprudence and academic research.
          </p>

          <p>
            The digital age has opened new possibilities for scholarship
            <Citation id="7">
              Ahmed El Shamsy, "The Canonization of Islamic Law: A Social and Intellectual History" (Cambridge: Cambridge University Press, 2013), pp. 201-225
            </Citation>
            , allowing for more comprehensive cross-textual analysis than ever before.
          </p>
        </div>

        <ReferencesList />
      </div>
    </ReferenceProvider>
  );
};

export default ExampleArticle;