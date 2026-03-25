// Vocabulary Extraction - Handles Finnish Inflection + Fallback

export const WORD_MEANINGS = {
  // Helsinki + cases
  'helsinki': 'Helsinki city', 'helsingin': 'of Helsinki', 'helsingissa': 'in Helsinki',
  
  // Keskusta + cases
  'keskusta': 'center downtown', 'keskustassa': 'in the center', 'keskustasta': 'from the center',
  
  // Common verbs (base + conjugated)
  'lainata': 'to borrow', 'lainaan': 'I borrow', 'lainattu': 'borrowed',
  'lukea': 'to read', 'luen': 'I read', 'luet': 'you read', 'lukee': 'reads',
  'kirjoittaa': 'to write', 'kirjoitan': 'I write', 'kirjoitat': 'you write',
  'puhua': 'to speak', 'puhun': 'I speak', 'puhut': 'you speak',
  'kuunnella': 'to listen', 'kuuntelen': 'I listen',
  'katsoa': 'to watch look', 'katsotaan': 'we watch',
  'mennä': 'to go', 'menen': 'I go', 'menee': 'goes', 'mennaan': 'we go',
  'tulla': 'to come', 'tulen': 'I come', 'tulee': 'comes',
  'tehdä': 'to do make', 'teen': 'I do', 'teet': 'you do', 'tekee': 'does',
  'saada': 'to get receive', 'saan': 'I get', 'saat': 'you get',
  'haluta': 'to want', 'haluan': 'I want', 'haluat': 'you want',
  'voida': 'to be able to', 'voin': 'I can', 'voit': 'you can',
  'pitää': 'to like must', 'pidän': 'I like',
  'tietää': 'to know', 'tiedän': 'I know', 'tiedät': 'you know',
  'ymmärtää': 'to understand', 'ymmärrän': 'I understand',
  'opiskella': 'to study', 'opiskelen': 'I study',
  'työskennellä': 'to work', 'työskentelen': 'I work',
  'asua': 'to live reside', 'asun': 'I live', 'asuu': 'lives',
  'käydä': 'to visit attend', 'käyn': 'I visit', 'käy': 'visits',
  'käyttää': 'to use', 'käytän': 'I use',
  'tarvita': 'to need', 'tarvitsen': 'I need',
  'kysyä': 'to ask', 'kysyn': 'I ask',
  'vastata': 'to answer', 'vastaan': 'I answer',
  'auttaa': 'to help', 'autan': 'I help',
  'maksaa': 'to cost pay', 'maksan': 'I pay',
  'ostaa': 'to buy', 'ostan': 'I buy',
  'myydä': 'to sell', 'myyn': 'I sell',
  'nähdä': 'to see', 'näen': 'I see',
  'kuulla': 'to hear', 'kuulen': 'I hear',
  'rakastaa': 'to love', 'rakastan': 'I love',
  'tykätä': 'to like', 'tykkään': 'I like',
  'pelätä': 'to fear', 'pelkään': 'I fear',
  'toivoa': 'to hope', 'toivon': 'I hope',
  'odottaa': 'to wait', 'odotan': 'I wait',
  'etsiä': 'to search', 'etsin': 'I search',
  'löytää': 'to find', 'löydän': 'I find',
  'alkaa': 'to start', 'alkaa': 'starts',
  'loppua': 'to end', 'loppuu': 'ends',
  'muistaa': 'to remember', 'muistan': 'I remember',
  'unohtaa': 'to forget', 'unohdan': 'I forget',
  'oppia': 'to learn', 'opin': 'I learn',
  'opettaa': 'to teach', 'opetan': 'I teach',
  'harjoitella': 'to practice', 'harjoittelen': 'I practice',
  'valmistautua': 'to prepare', 'valmistaudun': 'I prepare',
  'osallistua': 'to participate', 'osallistun': 'I participate',
  'järjestää': 'to organize', 'järjestän': 'I organize',
  'viettää': 'to spend time', 'vietän': 'I spend',
  
  // Common nouns (base + cases)
  'kirja': 'book', 'kirjan': 'book genitive', 'kirjaa': 'book partitive', 'kirjassa': 'in the book',
  'kirjasto': 'library', 'kirjaston': 'library genitive', 'kirjastossa': 'in the library', 'kirjastosta': 'from the library',
  'lehti': 'magazine newspaper', 'lehden': 'magazine genitive', 'lehdessa': 'in the magazine',
  'tietokone': 'computer', 'tietokoneen': 'computer genitive', 'tietokoneella': 'with the computer',
  'puhelin': 'phone', 'puhelimen': 'phone genitive', 'puhelimella': 'with the phone',
  'työ': 'work job', 'työn': 'work genitive', 'työssä': 'at work', 'työstä': 'from work',
  'koulu': 'school', 'koulun': 'school genitive', 'koulussa': 'at school', 'koulusta': 'from school',
  'opiskelija': 'student', 'opiskelijan': 'student genitive',
  'opettaja': 'teacher', 'opettajan': 'teacher genitive',
  'ruoka': 'food', 'ruoan': 'food genitive', 'ruokaa': 'food partitive',
  'kahvi': 'coffee', 'kahvin': 'coffee genitive', 'kahvia': 'coffee partitive',
  'vesi': 'water', 'veden': 'water genitive', 'vettä': 'water partitive',
  'talo': 'house', 'talon': 'house genitive', 'talossa': 'in the house',
  'asunto': 'apartment', 'asunnon': 'apartment genitive', 'asunnossa': 'in the apartment',
  'huone': 'room', 'huoneen': 'room genitive', 'huoneessa': 'in the room',
  'keittiö': 'kitchen', 'keittiön': 'kitchen genitive',
  'sauna': 'sauna', 'saunan': 'sauna genitive', 'saunassa': 'in the sauna',
  'auto': 'car', 'auton': 'car genitive', 'autossa': 'in the car',
  'bussi': 'bus', 'bussin': 'bus genitive', 'bussissa': 'on the bus',
  'juna': 'train', 'junan': 'train genitive', 'junassa': 'on the train',
  'kaupunki': 'city', 'kaupungin': 'city genitive', 'kaupungissa': 'in the city',
  'maa': 'country land', 'maan': 'country genitive', 'maassa': 'in the country',
  'suomi': 'Finnish language', 'suomen': 'Finnish genitive', 'suomea': 'Finnish partitive',
  'kieli': 'language', 'kielen': 'language genitive', 'kielessä': 'in the language',
  'ihminen': 'person', 'ihmisen': 'person genitive', 'ihmiset': 'people',
  'perhe': 'family', 'perheen': 'family genitive', 'perheessä': 'in the family',
  'ystävä': 'friend', 'ystävän': 'friend genitive', 'ystävää': 'friend partitive',
  'aika': 'time', 'ajan': 'time genitive', 'aikaa': 'time partitive',
  'päivä': 'day', 'päivän': 'day genitive', 'päivää': 'day partitive',
  'viikko': 'week', 'viikon': 'week genitive', 'viikolla': 'on the week',
  'kuukausi': 'month', 'kuukauden': 'month genitive',
  'vuosi': 'year', 'vuoden': 'year genitive', 'vuonna': 'in the year',
  'aamu': 'morning', 'aamun': 'morning genitive', 'aamulla': 'in the morning',
  'ilta': 'evening', 'illan': 'evening genitive', 'illalla': 'in the evening',
  'yö': 'night', 'yön': 'night genitive', 'yöllä': 'at night',
  'raha': 'money', 'rahan': 'money genitive', 'rahaa': 'money partitive',
  'kauppa': 'store shop', 'kaupan': 'store genitive', 'kaupassa': 'in the store',
  'ravintola': 'restaurant', 'ravintolan': 'restaurant genitive',
  'loma': 'vacation', 'loman': 'vacation genitive', 'lomalla': 'on vacation',
  'harrastus': 'hobby', 'harrastuksen': 'hobby genitive',
  'sää': 'weather', 'sään': 'weather genitive',
  
  // Adjectives
  'hyvä': 'good', 'hyvän': 'good genitive', 'hyvää': 'good partitive',
  'huono': 'bad', 'huonon': 'bad genitive',
  'suuri': 'big large', 'suuren': 'big genitive', 'suurta': 'big partitive',
  'pieni': 'small', 'pienen': 'small genitive', 'pientä': 'small partitive',
  'vanha': 'old', 'vanhan': 'old genitive', 'vanhaa': 'old partitive',
  'nuori': 'young', 'nuoren': 'young genitive',
  'uusi': 'new', 'uuden': 'new genitive', 'uutta': 'new partitive',
  'sama': 'same', 'saman': 'same genitive',
  'eri': 'different',
  'pitkä': 'long tall', 'pitkän': 'long genitive',
  'lyhyt': 'short', 'lyhyen': 'short genitive',
  'korkea': 'high', 'korkean': 'high genitive',
  'nopea': 'fast', 'nopean': 'fast genitive',
  'hidas': 'slow', 'hidasta': 'slow partitive',
  'kuuma': 'hot', 'kuuman': 'hot genitive',
  'kylmä': 'cold', 'kylmän': 'cold genitive',
  'lämmin': 'warm', 'lämpimän': 'warm genitive',
  'puhdas': 'clean', 'puhtaan': 'clean genitive',
  'kaunis': 'beautiful', 'kauniin': 'beautiful genitive',
  'kiva': 'nice', 'kivan': 'nice genitive',
  'helppo': 'easy', 'helpon': 'easy genitive',
  'vaikea': 'difficult', 'vaikean': 'difficult genitive',
  'tärkeä': 'important', 'tärkeän': 'important genitive',
  'kiinnostava': 'interesting', 'kiinnostavan': 'interesting genitive',
  'tylsä': 'boring', 'tylsän': 'boring genitive',
  'hauska': 'fun', 'hauskan': 'fun genitive',
  'surullinen': 'sad', 'surullisen': 'sad genitive',
  'iloinen': 'happy', 'iloisen': 'happy genitive',
  'väsynyt': 'tired', 'väsyneen': 'tired genitive',
  'terve': 'healthy', 'terveen': 'healthy genitive',
  'sairas': 'sick', 'sairaan': 'sick genitive',
  'kallis': 'expensive', 'kalliin': 'expensive genitive',
  'halpa': 'cheap', 'halvan': 'cheap genitive',
  'usein': 'often',
  'harvoin': 'rarely',
  'aina': 'always',
  'koskaan': 'never',
  'joskus': 'sometimes',
  'nyt': 'now',
  'sitten': 'then',
  'heti': 'immediately',
  'myöhemmin': 'later',
  'aikaisin': 'early',
  'myöhään': 'late',
  'oikea': 'right correct', 'oikean': 'right genitive',
  'väärä': 'wrong', 'väärän': 'wrong genitive',
  'totta': 'true',
  'varma': 'sure', 'varman': 'sure genitive',
  'selkeä': 'clear', 'selkeän': 'clear genitive',
  'yksinkertainen': 'simple', 'yksinkertaisen': 'simple genitive',
  'tavallinen': 'ordinary', 'tavallisen': 'ordinary genitive',
  'erikoinen': 'special', 'erikoisen': 'special genitive',
  'yleinen': 'common', 'yleisen': 'common genitive',
  'vapaa': 'free', 'vapaan': 'free genitive',
  'kiireinen': 'busy', 'kiireisen': 'busy genitive',
  'valmis': 'ready', 'valmiin': 'ready genitive'
};

// Simple Finnish stemmer - maps inflected forms to base
const stemFinnishWord = (word) => {
  const w = word.toLowerCase();
  
  // Direct match first
  if (WORD_MEANINGS[w]) return w;
  
  // Remove common case endings to find base form
  const endings = [
    'sta', 'stä', 'lla', 'llä', 'lta', 'ltä', 'na', 'nä', 'ksi', 'tta', 'ttä', 'ineen', 'ine',
    'n', 'a', 'ä', 'an', 'än', 'en', 't', 'i', 'ssa', 'ssä', 'seen', 'lle', 'ta', 'tä'
  ];
  
  for (const ending of endings) {
    if (w.endsWith(ending) && w.length > ending.length + 3) {
      const stem = w.slice(0, -ending.length);
      if (WORD_MEANINGS[stem]) return stem;
      for (const vowel of ['', 'a', 'ä', 'i', 'e', 'o', 'ö', 'u', 'y']) {
        const trial = stem + vowel;
        if (WORD_MEANINGS[trial]) return trial;
      }
    }
  }
  
  return w;
};

// Extract sentence from context
const extractSentenceFromContext = (word, contextText) => {
  if (!contextText) return null;
  const sentences = contextText.split(/[.!?]+/).filter(s => s.trim().length > 10).map(s => s.trim());
  const wordLower = word.toLowerCase();
  const found = sentences.find(s => s.toLowerCase().includes(wordLower));
  if (found) return found.endsWith('.') ? found : found + '.';
  return null;
};

const guessCategory = (word, meaning) => {
  if (!meaning || meaning === 'add meaning manually') return 'unknown';
  if (meaning.toLowerCase().includes('to ')) return 'verb';
  const adjList = ['good', 'bad', 'big', 'small', 'easy', 'difficult', 'important', 'happy', 'sad', 'tired', 'healthy', 'expensive', 'cheap', 'fast', 'slow', 'hot', 'cold', 'clean', 'free', 'busy', 'ready', 'right', 'wrong'];
  if (adjList.some(adj => meaning.toLowerCase().includes(adj))) return 'adjective';
  return 'noun';
};

export const enrichWord = (word, contextText = '') => {
  const cleanWord = word.toLowerCase().replace(/[^a-zäöå]/g, '');
  if (cleanWord.length < 3) return null;
  
  const baseForm = stemFinnishWord(cleanWord);
  const meaning = WORD_MEANINGS[baseForm];
  const finalMeaning = meaning || 'add meaning manually';
  
  const example = extractSentenceFromContext(cleanWord, contextText);
  if (!example) {
    console.log('No context sentence for:', cleanWord);
    return null;
  }
  
  return {
    id: 'vocab-' + Date.now() + Math.random().toString(36).substr(2, 5),
    word: cleanWord,
    baseForm: baseForm !== cleanWord ? baseForm : undefined,
    meaning: finalMeaning,
    example: example,
    exampleTranslation: '',
    category: guessCategory(cleanWord, finalMeaning),
    difficulty: meaning ? 'medium' : 'unknown',
    quizQuestion: '',
    quizOptions: [],
    quizCorrect: 0,
    flashcardFront: cleanWord,
    flashcardBack: meaning || '[Add translation]',
    source: 'reading-extracted',
    needsReview: !meaning,
    createdAt: new Date().toISOString()
  };
};

export const enrichWords = (words, contextText) => {
  return words.slice(0, 15).map(word => enrichWord(word, contextText)).filter(w => w !== null);
};

export const prepareVocabForFile = (enrichedWords) => {
  return {
    lastUpdated: new Date().toISOString(),
    vocabulary: enrichedWords
  };
};

export const copyVocabForGitHub = async (enrichedWords) => {
  const existing = await fetchVocabFromGitHub();
  const existingIds = new Set(existing.map(v => v.word.toLowerCase()));
  const newWords = enrichedWords.filter(w => !existingIds.has(w.word.toLowerCase()));
  const merged = [...existing, ...newWords];
  
  const json = JSON.stringify({
    lastUpdated: new Date().toISOString(),
    vocabulary: merged
  }, null, 2);
  
  await navigator.clipboard.writeText(json);
  return { copied: merged.length, new: newWords.length };
};

export const fetchVocabFromGitHub = async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/public/vocabularies.json?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      return data.vocabulary || [];
    }
  } catch (e) {
    console.warn('GitHub vocab fetch failed');
  }
  const local = localStorage.getItem('finnish-vocab-file');
  return local ? JSON.parse(local).vocabulary || [] : [];
};

export const wordExistsInVocab = async (word) => {
  const existing = await fetchVocabFromGitHub();
  return existing.some(v => v.word.toLowerCase() === word.toLowerCase());
};
