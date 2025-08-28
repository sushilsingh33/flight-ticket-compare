import axios from 'axios';

// API Configuration for Flight API
const API_CONFIG = {
  API_KEY: process.env.REACT_APP_FLIGHT_API_KEY ,
  TIMEOUT: process.env.REACT_APP_API_TIMEOUT || 200000,
};

// Secure logging utilities
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    const urlObj = new URL(url);
    
    // Replace API key in path segments with placeholder
    const pathSegments = urlObj.pathname.split('/');
    const sanitizedSegments = pathSegments.map(segment => {
      // Check if segment looks like an API key (long alphanumeric string)
      if (/^[a-zA-Z0-9]{20,}$/.test(segment)) {
        return '[API_KEY_REDACTED]';
      }
      return segment;
    });
    
    urlObj.pathname = sanitizedSegments.join('/');
    
    // Remove sensitive query parameters
    const sensitiveParams = ['key', 'api_key', 'apikey', 'token', 'secret', 'auth'];
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });
    
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, try basic string replacement
    return url.replace(/\/[a-zA-Z0-9]{20,}\//g, '/[API_KEY_REDACTED]/');
  }
};

const sanitizeErrorObject = (errorObj) => {
  if (!errorObj || typeof errorObj !== 'object') return errorObj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(errorObj)) {
    if (typeof value === 'string') {
      if (key.toLowerCase() === 'url') {
        sanitized[key] = sanitizeUrl(value);
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Secure logging functions
const secureLog = (message, data) => {
  console.log(message, sanitizeErrorObject(data));
};

const secureError = (message, error) => {
  console.error(message, sanitizeErrorObject(error));
};

// Comprehensive airport mapping - includes names, cities, codes, and aliases
const AIRPORT_MAPPING = {
  // Major Indian Airports (Existing)
  'indira gandhi international airport': 'DEL',
  'delhi airport': 'DEL',
  'new delhi': 'DEL',
  'delhi': 'DEL',
  'igi airport': 'DEL',
  'del': 'DEL',
  
  'chhatrapati shivaji international airport': 'BOM',
  'mumbai airport': 'BOM',
  'mumbai': 'BOM',
  'bombay': 'BOM',
  'csia': 'BOM',
  'bom': 'BOM',
  
  'kempegowda international airport': 'BLR',
  'bangalore airport': 'BLR',
  'bangalore': 'BLR',
  'bengaluru': 'BLR',
  'blr': 'BLR',
  
  'chennai international airport': 'MAA',
  'chennai airport': 'MAA',
  'chennai': 'MAA',
  'madras': 'MAA',
  'maa': 'MAA',
  
  'netaji subhas chandra bose international airport': 'CCU',
  'kolkata airport': 'CCU',
  'kolkata': 'CCU',
  'calcutta': 'CCU',
  'ccu': 'CCU',
  
  'rajiv gandhi international airport': 'HYD',
  'hyderabad airport': 'HYD',
  'hyderabad': 'HYD',
  'hyd': 'HYD',
  
  'cochin international airport': 'COK',
  'kochi airport': 'COK',
  'kochi': 'COK',
  'cochin': 'COK',
  'cok': 'COK',
  
  'pune airport': 'PNQ',
  'pune': 'PNQ',
  'pnq': 'PNQ',
  
  'sardar vallabhbhai patel international airport': 'AMD',
  'ahmedabad airport': 'AMD',
  'ahmedabad': 'AMD',
  'amd': 'AMD',
  
  'jaipur international airport': 'JAI',
  'jaipur airport': 'JAI',
  'jaipur': 'JAI',
  'jai': 'JAI',

  // Additional Indian Airports - Comprehensive List
  'goa airport': 'GOI',
  'dabolim airport': 'GOI',
  'goa': 'GOI',
  'goi': 'GOI',
  
  'trivandrum international airport': 'TRV',
  'thiruvananthapuram airport': 'TRV',
  'trivandrum': 'TRV',
  'thiruvananthapuram': 'TRV',
  'trv': 'TRV',
  
  'visakhapatnam airport': 'VTZ',
  'vizag airport': 'VTZ',
  'visakhapatnam': 'VTZ',
  'vizag': 'VTZ',
  'vtz': 'VTZ',
  
  'bhubaneswar airport': 'BBI',
  'biju patnaik international airport': 'BBI',
  'bhubaneswar': 'BBI',
  'bbi': 'BBI',
  
  'lucknow airport': 'LKO',
  'chaudhary charan singh international airport': 'LKO',
  'lucknow': 'LKO',
  'lko': 'LKO',
  
  'chandigarh airport': 'IXC',
  'chandigarh': 'IXC',
  'ixc': 'IXC',
  
  'coimbatore airport': 'CJB',
  'coimbatore international airport': 'CJB',
  'coimbatore': 'CJB',
  'cjb': 'CJB',
  
  'indore airport': 'IDR',
  'devi ahilya bai holkar airport': 'IDR',
  'indore': 'IDR',
  'idr': 'IDR',
  
  'nagpur airport': 'NAG',
  'dr. babasaheb ambedkar international airport': 'NAG',
  'nagpur': 'NAG',
  'nag': 'NAG',
  
  'vadodara airport': 'BDQ',
  'vadodara': 'BDQ',
  'baroda': 'BDQ',
  'bdq': 'BDQ',
  
  'surat airport': 'STV',
  'surat': 'STV',
  'stv': 'STV',
  
  'raipur airport': 'RPR',
  'swami vivekananda airport': 'RPR',
  'raipur': 'RPR',
  'rpr': 'RPR',
  
  'ranchi airport': 'IXR',
  'birsa munda airport': 'IXR',
  'ranchi': 'IXR',
  'ixr': 'IXR',
  
  'patna airport': 'PAT',
  'jay prakash narayan airport': 'PAT',
  'patna': 'PAT',
  'pat': 'PAT',
  
  'guwahati airport': 'GAU',
  'lokpriya gopinath bordoloi international airport': 'GAU',
  'guwahati': 'GAU',
  'gau': 'GAU',
  
  'imphal airport': 'IMF',
  'bir tikendrajit international airport': 'IMF',
  'imphal': 'IMF',
  'imf': 'IMF',
  
  'dibrugarh airport': 'DIB',
  'mohanbari airport': 'DIB',
  'dibrugarh': 'DIB',
  'dib': 'DIB',
  
  'agartala airport': 'IXA',
  'maharaja bir bikram airport': 'IXA',
  'agartala': 'IXA',
  'ixa': 'IXA',
  
  'jammu airport': 'IXJ',
  'jammu': 'IXJ',
  'ixj': 'IXJ',
  
  'srinagar airport': 'SXR',
  'sheikh ul-alam international airport': 'SXR',
  'srinagar': 'SXR',
  'sxr': 'SXR',
  
  'leh airport': 'IXL',
  'kushok bakula rimpochee airport': 'IXL',
  'leh': 'IXL',
  'ixl': 'IXL',
  
  'port blair airport': 'IXZ',
  'veer savarkar international airport': 'IXZ',
  'port blair': 'IXZ',
  'ixz': 'IXZ',

  // Additional Indian Regional Airports
  'mangalore airport': 'IXE',
  'mangaluru international airport': 'IXE',
  'mangalore': 'IXE',
  'mangaluru': 'IXE',
  'ixe': 'IXE',

  'hubli airport': 'HBX',
  'hubli': 'HBX',
  'hbx': 'HBX',

  'mysore airport': 'MYQ',
  'mysuru airport': 'MYQ',
  'mysore': 'MYQ',
  'mysuru': 'MYQ',
  'myq': 'MYQ',

  'salem airport': 'SXV',
  'salem': 'SXV',
  'sxv': 'SXV',

  'madurai airport': 'IXM',
  'madurai': 'IXM',
  'ixm': 'IXM',

  'tiruchirappalli airport': 'TRZ',
  'trichy airport': 'TRZ',
  'tiruchirappalli': 'TRZ',
  'trichy': 'TRZ',
  'trz': 'TRZ',

  'tuticorin airport': 'TCR',
  'tuticorin': 'TCR',
  'thoothukudi': 'TCR',
  'tcr': 'TCR',

  'vijayawada airport': 'VGA',
  'vijayawada': 'VGA',
  'vga': 'VGA',

  'tirupati airport': 'TIR',
  'tirupati': 'TIR',
  'tir': 'TIR',

  'rajahmundry airport': 'RJA',
  'rajahmundry': 'RJA',
  'rja': 'RJA',

  'aurangabad airport': 'IXU',
  'aurangabad': 'IXU',
  'ixu': 'IXU',

  'nashik airport': 'ISK',
  'ozar airport': 'ISK',
  'nashik': 'ISK',
  'isk': 'ISK',

  'kolhapur airport': 'KLH',
  'kolhapur': 'KLH',
  'klh': 'KLH',

  'udaipur airport': 'UDR',
  'maharana pratap airport': 'UDR',
  'udaipur': 'UDR',
  'udr': 'UDR',

  'jodhpur airport': 'JDH',
  'jodhpur': 'JDH',
  'jdh': 'JDH',

  'bikaner airport': 'BKB',
  'nal airport': 'BKB',
  'bikaner': 'BKB',
  'bkb': 'BKB',

  'shimla airport': 'SLV',
  'jubbarhatti airport': 'SLV',
  'shimla': 'SLV',
  'slv': 'SLV',

  'kullu airport': 'KUU',
  'bhuntar airport': 'KUU',
  'kullu': 'KUU',
  'manali': 'KUU',
  'kuu': 'KUU',

  'dehradun airport': 'DED',
  'jolly grant airport': 'DED',
  'dehradun': 'DED',
  'ded': 'DED',

  'pantnagar airport': 'PGH',
  'pantnagar': 'PGH',
  'pgh': 'PGH',

  'bagdogra airport': 'IXB',
  'bagdogra': 'IXB',
  'siliguri': 'IXB',
  'ixb': 'IXB',

  'durgapur airport': 'RDP',
  'kazi nazrul islam airport': 'RDP',
  'durgapur': 'RDP',
  'rdp': 'RDP',

  'malda airport': 'LDA',
  'malda': 'LDA',
  'lda': 'LDA',

  'jharsuguda airport': 'JRG',
  'veer surendra sai airport': 'JRG',
  'jharsuguda': 'JRG',
  'jrg': 'JRG',

  'silchar airport': 'IXS',
  'kumbhirgram airport': 'IXS',
  'silchar': 'IXS',
  'ixs': 'IXS',

  'jorhat airport': 'JRH',
  'rowriah airport': 'JRH',
  'jorhat': 'JRH',
  'jrh': 'JRH',

  'tezpur airport': 'TEZ',
  'salonibari airport': 'TEZ',
  'tezpur': 'TEZ',
  'tez': 'TEZ',

  'lilabari airport': 'IXI',
  'lilabari': 'IXI',
  'north lakhimpur': 'IXI',
  'ixi': 'IXI',

  'passighat airport': 'IXT',
  'pasighat': 'IXT',
  'ixt': 'IXT',

  'aizawl airport': 'AJL',
  'lengpui airport': 'AJL',
  'aizawl': 'AJL',
  'ajl': 'AJL',

  'shillong airport': 'SHL',
  'umroi airport': 'SHL',
  'shillong': 'SHL',
  'shl': 'SHL',

  // Major International Airports

  // United States
  'john f kennedy international airport': 'JFK',
  'jfk airport': 'JFK',
  'kennedy airport': 'JFK',
  'new york jfk': 'JFK',
  'jfk': 'JFK',
  
  'los angeles international airport': 'LAX',
  'lax airport': 'LAX',
  'los angeles airport': 'LAX',
  'los angeles': 'LAX',
  'la airport': 'LAX',
  'lax': 'LAX',

  'san francisco international airport': 'SFO',
  'san francisco airport': 'SFO',
  'san francisco': 'SFO',
  'sfo': 'SFO',
  
  'chicago ohare international airport': 'ORD',
  "o'hare airport": 'ORD',
  'ohare airport': 'ORD',
  'chicago airport': 'ORD',
  'chicago': 'ORD',
  'ord': 'ORD',
  
  'miami international airport': 'MIA',
  'miami airport': 'MIA',
  'miami': 'MIA',
  'mia': 'MIA',
  
  'boston logan international airport': 'BOS',
  'logan airport': 'BOS',
  'boston airport': 'BOS',
  'boston': 'BOS',
  'bos': 'BOS',
  
  'seattle tacoma international airport': 'SEA',
  'seattle airport': 'SEA',
  'seattle': 'SEA',
  'sea': 'SEA',
  
  'denver international airport': 'DEN',
  'denver airport': 'DEN',
  'denver': 'DEN',
  'den': 'DEN',
  
  'newark liberty international airport': 'EWR',
  'newark airport': 'EWR',
  'newark': 'EWR',
  'ewr': 'EWR',
  
  'laguardia airport': 'LGA',
  'la guardia': 'LGA',
  'lga': 'LGA',

  'atlanta hartsfield jackson international airport': 'ATL',
  'atlanta airport': 'ATL',
  'atlanta': 'ATL',
  'atl': 'ATL',

  'dallas fort worth international airport': 'DFW',
  'dallas airport': 'DFW',
  'dallas': 'DFW',
  'dfw': 'DFW',

  'las vegas mccarran international airport': 'LAS',
  'las vegas airport': 'LAS',
  'las vegas': 'LAS',
  'las': 'LAS',

  'phoenix sky harbor international airport': 'PHX',
  'phoenix airport': 'PHX',
  'phoenix': 'PHX',
  'phx': 'PHX',

  'houston george bush intercontinental airport': 'IAH',
  'houston airport': 'IAH',
  'houston': 'IAH',
  'iah': 'IAH',

  'orlando international airport': 'MCO',
  'orlando airport': 'MCO',
  'orlando': 'MCO',
  'mco': 'MCO',

  'washington dulles international airport': 'IAD',
  'dulles airport': 'IAD',
  'washington dc airport': 'IAD',
  'iad': 'IAD',

  'minneapolis saint paul international airport': 'MSP',
  'minneapolis airport': 'MSP',
  'minneapolis': 'MSP',
  'msp': 'MSP',

  'detroit metropolitan wayne county airport': 'DTW',
  'detroit airport': 'DTW',
  'detroit': 'DTW',
  'dtw': 'DTW',

  'philadelphia international airport': 'PHL',
  'philadelphia airport': 'PHL',
  'philadelphia': 'PHL',
  'phl': 'PHL',

  // United Kingdom
  'heathrow airport': 'LHR',
  'london heathrow': 'LHR',
  'heathrow': 'LHR',
  'london': 'LHR',
  'lhr': 'LHR',

  'gatwick airport': 'LGW',
  'london gatwick': 'LGW',
  'gatwick': 'LGW',
  'lgw': 'LGW',

  'stansted airport': 'STN',
  'london stansted': 'STN',
  'stansted': 'STN',
  'stn': 'STN',

  'luton airport': 'LTN',
  'london luton': 'LTN',
  'luton': 'LTN',
  'ltn': 'LTN',

  'manchester airport': 'MAN',
  'manchester': 'MAN',
  'man': 'MAN',

  'edinburgh airport': 'EDI',
  'edinburgh': 'EDI',
  'edi': 'EDI',

  'glasgow airport': 'GLA',
  'glasgow': 'GLA',
  'gla': 'GLA',

  'birmingham airport': 'BHX',
  'birmingham uk': 'BHX',
  'bhx': 'BHX',

  // France
  'charles de gaulle airport': 'CDG',
  'paris charles de gaulle': 'CDG',
  'paris airport': 'CDG',
  'paris': 'CDG',
  'cdg': 'CDG',

  'orly airport': 'ORY',
  'paris orly': 'ORY',
  'orly': 'ORY',
  'ory': 'ORY',

  'nice cote dazur airport': 'NCE',
  'nice airport': 'NCE',
  'nice': 'NCE',
  'nce': 'NCE',

  'lyon saint exupery airport': 'LYS',
  'lyon airport': 'LYS',
  'lyon': 'LYS',
  'lys': 'LYS',

  'marseille provence airport': 'MRS',
  'marseille airport': 'MRS',
  'marseille': 'MRS',
  'mrs': 'MRS',

  // Germany
  'frankfurt airport': 'FRA',
  'frankfurt am main': 'FRA',
  'frankfurt': 'FRA',
  'fra': 'FRA',

  'munich airport': 'MUC',
  'munich franz josef strauss': 'MUC',
  'munich': 'MUC',
  'muc': 'MUC',

  'berlin brandenburg airport': 'BER',
  'berlin airport': 'BER',
  'berlin': 'BER',
  'ber': 'BER',

  'hamburg airport': 'HAM',
  'hamburg': 'HAM',
  'ham': 'HAM',

  'dusseldorf airport': 'DUS',
  'dusseldorf': 'DUS',
  'dus': 'DUS',

  'cologne bonn airport': 'CGN',
  'cologne airport': 'CGN',
  'cologne': 'CGN',
  'cgn': 'CGN',

  // Netherlands
  'amsterdam schiphol airport': 'AMS',
  'schiphol airport': 'AMS',
  'amsterdam airport': 'AMS',
  'amsterdam': 'AMS',
  'ams': 'AMS',

  // Switzerland
  'zurich airport': 'ZUR',
  'zurich': 'ZUR',
  'zur': 'ZUR',

  'geneva airport': 'GVA',
  'geneva': 'GVA',
  'gva': 'GVA',

  // Italy
  'leonardo da vinci fiumicino airport': 'FCO',
  'rome fiumicino': 'FCO',
  'rome airport': 'FCO',
  'rome': 'FCO',
  'fco': 'FCO',

  'milan malpensa airport': 'MXP',
  'malpensa airport': 'MXP',
  'milan airport': 'MXP',
  'milan': 'MXP',
  'mxp': 'MXP',

  'naples airport': 'NAP',
  'naples': 'NAP',
  'nap': 'NAP',

  'venice marco polo airport': 'VCE',
  'venice airport': 'VCE',
  'venice': 'VCE',
  'vce': 'VCE',

  'florence airport': 'FLR',
  'florence': 'FLR',
  'flr': 'FLR',

  // Spain
  'madrid barajas airport': 'MAD',
  'madrid airport': 'MAD',
  'madrid': 'MAD',
  'mad': 'MAD',

  'barcelona el prat airport': 'BCN',
  'barcelona airport': 'BCN',
  'barcelona': 'BCN',
  'bcn': 'BCN',

  'palma de mallorca airport': 'PMI',
  'palma airport': 'PMI',
  'palma': 'PMI',
  'pmi': 'PMI',

  'seville airport': 'SVQ',
  'seville': 'SVQ',
  'svq': 'SVQ',

  'valencia airport': 'VLC',
  'valencia': 'VLC',
  'vlc': 'VLC',

  // Turkey
  'istanbul airport': 'IST',
  'istanbul new airport': 'IST',
  'istanbul': 'IST',
  'ist': 'IST',

  'sabiha gokcen international airport': 'SAW',
  'istanbul sabiha gokcen': 'SAW',
  'saw': 'SAW',

  'ankara esenboga airport': 'ESB',
  'ankara airport': 'ESB',
  'ankara': 'ESB',
  'esb': 'ESB',

  // Middle East
  'dubai international airport': 'DXB',
  'dubai airport': 'DXB',
  'dubai': 'DXB',
  'dxb': 'DXB',

  'abu dhabi international airport': 'AUH',
  'abu dhabi airport': 'AUH',
  'abu dhabi': 'AUH',
  'auh': 'AUH',

  'doha hamad international airport': 'DOH',
  'hamad international airport': 'DOH',
  'doha airport': 'DOH',
  'doha': 'DOH',
  'doh': 'DOH',

  'kuwait international airport': 'KWI',
  'kuwait airport': 'KWI',
  'kuwait': 'KWI',
  'kwi': 'KWI',

  'riyadh king khalid international airport': 'RUH',
  'riyadh airport': 'RUH',
  'riyadh': 'RUH',
  'ruh': 'RUH',

  'jeddah king abdulaziz international airport': 'JED',
  'jeddah airport': 'JED',
  'jeddah': 'JED',
  'jed': 'JED',

  'muscat international airport': 'MCT',
  'muscat airport': 'MCT',
  'muscat': 'MCT',
  'mct': 'MCT',

  'bahrain international airport': 'BAH',
  'bahrain airport': 'BAH',
  'bahrain': 'BAH',
  'bah': 'BAH',

  'tel aviv ben gurion airport': 'TLV',
  'ben gurion airport': 'TLV',
  'tel aviv airport': 'TLV',
  'tel aviv': 'TLV',
  'tlv': 'TLV',

  // Asia
  'singapore changi airport': 'SIN',
  'changi airport': 'SIN',
  'singapore airport': 'SIN',
  'singapore': 'SIN',
  'sin': 'SIN',

  'hong kong international airport': 'HKG',
  'hong kong airport': 'HKG',
  'hong kong': 'HKG',
  'hkg': 'HKG',

  'tokyo narita international airport': 'NRT',
  'narita airport': 'NRT',
  'tokyo narita': 'NRT',
  'narita': 'NRT',
  'nrt': 'NRT',

  'tokyo haneda airport': 'HND',
  'haneda airport': 'HND',
  'tokyo haneda': 'HND',
  'haneda': 'HND',
  'hnd': 'HND',

  'osaka kansai international airport': 'KIX',
  'kansai airport': 'KIX',
  'osaka airport': 'KIX',
  'osaka': 'KIX',
  'kix': 'KIX',

  'beijing capital international airport': 'PEK',
  'beijing airport': 'PEK',
  'beijing': 'PEK',
  'pek': 'PEK',

  'shanghai pudong international airport': 'PVG',
  'pudong airport': 'PVG',
  'shanghai pudong': 'PVG',
  'shanghai': 'PVG',
  'pvg': 'PVG',

  'guangzhou baiyun international airport': 'CAN',
  'guangzhou airport': 'CAN',
  'guangzhou': 'CAN',
  'can': 'CAN',

  'shenzhen bao an international airport': 'SZX',
  'shenzhen airport': 'SZX',
  'shenzhen': 'SZX',
  'szx': 'SZX',

  'chengdu shuangliu international airport': 'CTU',
  'chengdu airport': 'CTU',
  'chengdu': 'CTU',
  'ctu': 'CTU',

  'seoul incheon international airport': 'ICN',
  'incheon airport': 'ICN',
  'seoul airport': 'ICN',
  'seoul': 'ICN',
  'icn': 'ICN',

  'busan gimhae international airport': 'PUS',
  'gimhae airport': 'PUS',
  'busan airport': 'PUS',
  'busan': 'PUS',
  'pus': 'PUS',

  'taipei taoyuan international airport': 'TPE',
  'taoyuan airport': 'TPE',
  'taipei airport': 'TPE',
  'taipei': 'TPE',
  'tpe': 'TPE',

  'manila ninoy aquino international airport': 'MNL',
  'manila airport': 'MNL',
  'manila': 'MNL',
  'mnl': 'MNL',

  'cebu mactan cebu international airport': 'CEB',
  'cebu airport': 'CEB',
  'cebu': 'CEB',
  'ceb': 'CEB',

  'bangkok suvarnabhumi airport': 'BKK',
  'suvarnabhumi airport': 'BKK',
  'bangkok airport': 'BKK',
  'bangkok': 'BKK',
  'bkk': 'BKK',

  'bangkok don mueang international airport': 'DMK',
  'don mueang airport': 'DMK',
  'dmk': 'DMK',

  'phuket international airport': 'HKT',
  'phuket airport': 'HKT',
  'phuket': 'HKT',
  'hkt': 'HKT',

  'kuala lumpur international airport': 'KUL',
  'klia': 'KUL',
  'kuala lumpur airport': 'KUL',
  'kuala lumpur': 'KUL',
  'kul': 'KUL',

  'penang international airport': 'PEN',
  'penang airport': 'PEN',
  'penang': 'PEN',
  'pen': 'PEN',

  'jakarta soekarno hatta international airport': 'CGK',
  'soekarno hatta airport': 'CGK',
  'jakarta airport': 'CGK',
  'jakarta': 'CGK',
  'cgk': 'CGK',

  'bali ngurah rai international airport': 'DPS',
  'ngurah rai airport': 'DPS',
  'bali airport': 'DPS',
  'denpasar airport': 'DPS',
  'bali': 'DPS',
  'dps': 'DPS',

  'ho chi minh city tan son nhat airport': 'SGN',
  'tan son nhat airport': 'SGN',
  'ho chi minh airport': 'SGN',
  'saigon airport': 'SGN',
  'sgn': 'SGN',

  'hanoi noi bai international airport': 'HAN',
  'noi bai airport': 'HAN',
  'hanoi airport': 'HAN',
  'hanoi': 'HAN',
  'han': 'HAN',

  'colombo bandaranaike international airport': 'CMB',
  'bandaranaike airport': 'CMB',
  'colombo airport': 'CMB',
  'colombo': 'CMB',
  'cmb': 'CMB',

  'kathmandu tribhuvan international airport': 'KTM',
  'tribhuvan airport': 'KTM',
  'kathmandu airport': 'KTM',
  'kathmandu': 'KTM',
  'ktm': 'KTM',

  'dhaka hazrat shahjalal international airport': 'DAC',
  'hazrat shahjalal airport': 'DAC',
  'dhaka airport': 'DAC',
  'dhaka': 'DAC',
  'dac': 'DAC',

  'chittagong shah amanat international airport': 'CGP',
  'chittagong airport': 'CGP',
  'chittagong': 'CGP',
  'cgp': 'CGP',

  'yangon international airport': 'RGN',
  'yangon airport': 'RGN',
  'yangon': 'RGN',
  'rgn': 'RGN',

  'phnom penh international airport': 'PNH',
  'phnom penh airport': 'PNH',
  'phnom penh': 'PNH',
  'pnh': 'PNH',

  'vientiane wattay international airport': 'VTE',
  'wattay airport': 'VTE',
  'vientiane airport': 'VTE',
  'vientiane': 'VTE',
  'vte': 'VTE',

  // Canada
  'toronto pearson international airport': 'YYZ',
  'pearson airport': 'YYZ',
  'toronto airport': 'YYZ',
  'toronto': 'YYZ',
  'yyz': 'YYZ',

  'vancouver international airport': 'YVR',
  'vancouver airport': 'YVR',
  'vancouver': 'YVR',
  'yvr': 'YVR',

  'montreal pierre elliott trudeau international airport': 'YUL',
  'montreal airport': 'YUL',
  'montreal': 'YUL',
  'yul': 'YUL',

  'calgary international airport': 'YYC',
  'calgary airport': 'YYC',
  'calgary': 'YYC',
  'yyc': 'YYC',

  'edmonton international airport': 'YEG',
  'edmonton airport': 'YEG',
  'edmonton': 'YEG',
  'yeg': 'YEG',

  'ottawa macdonald cartier international airport': 'YOW',
  'ottawa airport': 'YOW',
  'ottawa': 'YOW',
  'yow': 'YOW',

  'winnipeg richardson international airport': 'YWG',
  'winnipeg airport': 'YWG',
  'winnipeg': 'YWG',
  'ywg': 'YWG',

  'halifax stanfield international airport': 'YHZ',
  'halifax airport': 'YHZ',
  'halifax': 'YHZ',
  'yhz': 'YHZ',

  // Australia & New Zealand
  'sydney kingsford smith airport': 'SYD',
  'sydney airport': 'SYD',
  'sydney': 'SYD',
  'syd': 'SYD',

  'melbourne tullamarine airport': 'MEL',
  'melbourne airport': 'MEL',
  'melbourne': 'MEL',
  'mel': 'MEL',

  'brisbane airport': 'BNE',
  'brisbane': 'BNE',
  'bne': 'BNE',

  'perth airport': 'PER',
  'perth': 'PER',
  'per': 'PER',

  'adelaide airport': 'ADL',
  'adelaide': 'ADL',
  'adl': 'ADL',

  'gold coast airport': 'OOL',
  'gold coast': 'OOL',
  'ool': 'OOL',

  'cairns airport': 'CNS',
  'cairns': 'CNS',
  'cns': 'CNS',

  'darwin airport': 'DRW',
  'darwin': 'DRW',
  'drw': 'DRW',

  'hobart airport': 'HBA',
  'hobart': 'HBA',
  'hba': 'HBA',

  'auckland airport': 'AKL',
  'auckland': 'AKL',
  'akl': 'AKL',

  'wellington airport': 'WLG',
  'wellington': 'WLG',
  'wlg': 'WLG',

  'christchurch airport': 'CHC',
  'christchurch': 'CHC',
  'chc': 'CHC',

  'queenstown airport': 'ZQN',
  'queenstown': 'ZQN',
  'zqn': 'ZQN',

  // South America
  'sao paulo guarulhos international airport': 'GRU',
  'guarulhos airport': 'GRU',
  'sao paulo airport': 'GRU',
  'sao paulo': 'GRU',
  'gru': 'GRU',

  'rio de janeiro galeao international airport': 'GIG',
  'galeao airport': 'GIG',
  'rio de janeiro airport': 'GIG',
  'rio de janeiro': 'GIG',
  'gig': 'GIG',

  'brasilia international airport': 'BSB',
  'brasilia airport': 'BSB',
  'brasilia': 'BSB',
  'bsb': 'BSB',

  'buenos aires ezeiza international airport': 'EZE',
  'ezeiza airport': 'EZE',
  'buenos aires airport': 'EZE',
  'buenos aires': 'EZE',
  'eze': 'EZE',

  'lima jorge chavez international airport': 'LIM',
  'jorge chavez airport': 'LIM',
  'lima airport': 'LIM',
  'lima': 'LIM',
  'lim': 'LIM',

  'bogota el dorado international airport': 'BOG',
  'el dorado airport': 'BOG',
  'bogota airport': 'BOG',
  'bogota': 'BOG',
  'bog': 'BOG',

  'santiago comodoro arturo merino benitez international airport': 'SCL',
  'santiago airport': 'SCL',
  'santiago': 'SCL',
  'scl': 'SCL',

  'caracas simon bolivar international airport': 'CCS',
  'simon bolivar airport': 'CCS',
  'caracas airport': 'CCS',
  'caracas': 'CCS',
  'ccs': 'CCS',

  'quito mariscal sucre international airport': 'UIO',
  'quito airport': 'UIO',
  'quito': 'UIO',
  'uio': 'UIO',

  'montevideo carrasco international airport': 'MVD',
  'carrasco airport': 'MVD',
  'montevideo airport': 'MVD',
  'montevideo': 'MVD',
  'mvd': 'MVD',

  'la paz el alto international airport': 'LPB',
  'el alto airport': 'LPB',
  'la paz airport': 'LPB',
  'la paz': 'LPB',
  'lpb': 'LPB',

  'asuncion silvio pettirossi international airport': 'ASU',
  'silvio pettirossi airport': 'ASU',
  'asuncion airport': 'ASU',
  'asuncion': 'ASU',
  'asu': 'ASU',

  'georgetown cheddi jagan international airport': 'GEO',
  'cheddi jagan airport': 'GEO',
  'georgetown airport': 'GEO',
  'georgetown': 'GEO',
  'geo': 'GEO',

  'paramaribo johan adolf pengel international airport': 'PBM',
  'johan adolf pengel airport': 'PBM',
  'paramaribo airport': 'PBM',
  'paramaribo': 'PBM',
  'pbm': 'PBM',

  // Africa
  'johannesburg or tambo international airport': 'JNB',
  'or tambo airport': 'JNB',
  'johannesburg airport': 'JNB',
  'johannesburg': 'JNB',
  'jnb': 'JNB',

  'cape town international airport': 'CPT',
  'cape town airport': 'CPT',
  'cape town': 'CPT',
  'cpt': 'CPT',

  'durban king shaka international airport': 'DUR',
  'king shaka airport': 'DUR',
  'durban airport': 'DUR',
  'durban': 'DUR',
  'dur': 'DUR',

  'cairo international airport': 'CAI',
  'cairo airport': 'CAI',
  'cairo': 'CAI',
  'cai': 'CAI',

  'addis ababa bole international airport': 'ADD',
  'bole airport': 'ADD',
  'addis ababa airport': 'ADD',
  'addis ababa': 'ADD',
  'add': 'ADD',

  'nairobi jomo kenyatta international airport': 'NBO',
  'jomo kenyatta airport': 'NBO',
  'nairobi airport': 'NBO',
  'nairobi': 'NBO',
  'nbo': 'NBO',

  'lagos murtala muhammed international airport': 'LOS',
  'murtala muhammed airport': 'LOS',
  'lagos airport': 'LOS',
  'lagos': 'LOS',
  'los': 'LOS',

  'abuja nnamdi azikiwe international airport': 'ABV',
  'nnamdi azikiwe airport': 'ABV',
  'abuja airport': 'ABV',
  'abuja': 'ABV',
  'abv': 'ABV',

  'accra kotoka international airport': 'ACC',
  'kotoka airport': 'ACC',
  'accra airport': 'ACC',
  'accra': 'ACC',
  'acc': 'ACC',

  'casablanca mohammed v international airport': 'CMN',
  'mohammed v airport': 'CMN',
  'casablanca airport': 'CMN',
  'casablanca': 'CMN',
  'cmn': 'CMN',

  'marrakech menara airport': 'RAK',
  'menara airport': 'RAK',
  'marrakech airport': 'RAK',
  'marrakech': 'RAK',
  'rak': 'RAK',

  'tunis carthage international airport': 'TUN',
  'carthage airport': 'TUN',
  'tunis airport': 'TUN',
  'tunis': 'TUN',
  'tun': 'TUN',

  'algiers houari boumediene airport': 'ALG',
  'houari boumediene airport': 'ALG',
  'algiers airport': 'ALG',
  'algiers': 'ALG',
  'alg': 'ALG',

  'dar es salaam julius nyerere international airport': 'DAR',
  'julius nyerere airport': 'DAR',
  'dar es salaam airport': 'DAR',
  'dar es salaam': 'DAR',
  'dar': 'DAR',

  'kigali international airport': 'KGL',
  'kigali airport': 'KGL',
  'kigali': 'KGL',
  'kgl': 'KGL',

  'entebbe international airport': 'EBB',
  'entebbe airport': 'EBB',
  'kampala airport': 'EBB',
  'kampala': 'EBB',
  'ebb': 'EBB',

  'lusaka kenneth kaunda international airport': 'LUN',
  'kenneth kaunda airport': 'LUN',
  'lusaka airport': 'LUN',
  'lusaka': 'LUN',
  'lun': 'LUN',

  'harare robert gabriel mugabe international airport': 'HRE',
  'robert gabriel mugabe airport': 'HRE',
  'harare airport': 'HRE',
  'harare': 'HRE',
  'hre': 'HRE',

  'maputo international airport': 'MPM',
  'maputo airport': 'MPM',
  'maputo': 'MPM',
  'mpm': 'MPM',

  'windhoek hosea kutako international airport': 'WDH',
  'hosea kutako airport': 'WDH',
  'windhoek airport': 'WDH',
  'windhoek': 'WDH',
  'wdh': 'WDH',

  'gaborone sir seretse khama international airport': 'GBE',
  'sir seretse khama airport': 'GBE',
  'gaborone airport': 'GBE',
  'gaborone': 'GBE',
  'gbe': 'GBE',

  'antananarivo ivato international airport': 'TNR',
  'ivato airport': 'TNR',
  'antananarivo airport': 'TNR',
  'antananarivo': 'TNR',
  'tnr': 'TNR',

  'port louis sir seewoosagur ramgoolam international airport': 'MRU',
  'sir seewoosagur ramgoolam airport': 'MRU',
  'mauritius airport': 'MRU',
  'port louis airport': 'MRU',
  'mauritius': 'MRU',
  'mru': 'MRU',

  // Russia & CIS
  'moscow sheremetyevo international airport': 'SVO',
  'sheremetyevo airport': 'SVO',
  'moscow sheremetyevo': 'SVO',
  'moscow': 'SVO',
  'svo': 'SVO',

  'moscow domodedovo international airport': 'DME',
  'domodedovo airport': 'DME',
  'moscow domodedovo': 'DME',
  'dme': 'DME',

  'moscow vnukovo international airport': 'VKO',
  'vnukovo airport': 'VKO',
  'moscow vnukovo': 'VKO',
  'vko': 'VKO',

  'st petersburg pulkovo airport': 'LED',
  'pulkovo airport': 'LED',
  'st petersburg airport': 'LED',
  'st petersburg': 'LED',
  'led': 'LED',

  'yekaterinburg koltsovo airport': 'SVX',
  'koltsovo airport': 'SVX',
  'yekaterinburg airport': 'SVX',
  'yekaterinburg': 'SVX',
  'svx': 'SVX',

  'novosibirsk tolmachevo airport': 'OVB',
  'tolmachevo airport': 'OVB',
  'novosibirsk airport': 'OVB',
  'novosibirsk': 'OVB',
  'ovb': 'OVB',

  'kiev boryspil international airport': 'KBP',
  'boryspil airport': 'KBP',
  'kiev airport': 'KBP',
  'kyiv airport': 'KBP',
  'kiev': 'KBP',
  'kbp': 'KBP',

  'almaty airport': 'ALA',
  'almaty': 'ALA',
  'ala': 'ALA',

  'tashkent international airport': 'TAS',
  'tashkent airport': 'TAS',
  'tashkent': 'TAS',
  'tas': 'TAS',

  'baku heydar aliyev international airport': 'GYD',
  'heydar aliyev airport': 'GYD',
  'baku airport': 'GYD',
  'baku': 'GYD',
  'gyd': 'GYD',

  'tbilisi international airport': 'TBS',
  'tbilisi airport': 'TBS',
  'tbilisi': 'TBS',
  'tbs': 'TBS',

  'yerevan zvartnots international airport': 'EVN',
  'zvartnots airport': 'EVN',
  'yerevan airport': 'EVN',
  'yerevan': 'EVN',
  'evn': 'EVN',

  'minsk national airport': 'MSQ',
  'minsk airport': 'MSQ',
  'minsk': 'MSQ',
  'msq': 'MSQ',

  // Iran & Central Asia
  'tehran imam khomeini international airport': 'IKA',
  'imam khomeini airport': 'IKA',
  'tehran airport': 'IKA',
  'tehran': 'IKA',
  'ika': 'IKA',

  'isfahan airport': 'IFN',
  'isfahan': 'IFN',
  'ifn': 'IFN',

  'shiraz airport': 'SYZ',
  'shiraz': 'SYZ',
  'syz': 'SYZ',

  'mashhad airport': 'MHD',
  'mashhad': 'MHD',
  'mhd': 'MHD',

  'kabul hamid karzai international airport': 'KBL',
  'hamid karzai airport': 'KBL',
  'kabul airport': 'KBL',
  'kabul': 'KBL',
  'kbl': 'KBL',

  'islamabad international airport': 'ISB',
  'islamabad airport': 'ISB',
  'islamabad': 'ISB',
  'isb': 'ISB',

  'karachi jinnah international airport': 'KHI',
  'jinnah international airport': 'KHI',
  'karachi airport': 'KHI',
  'karachi': 'KHI',
  'khi': 'KHI',

  'lahore allama iqbal international airport': 'LHE',
  'allama iqbal airport': 'LHE',
  'lahore airport': 'LHE',
  'lahore': 'LHE',
  'lhe': 'LHE',

  'peshawar bacha khan international airport': 'PEW',
  'bacha khan airport': 'PEW',
  'peshawar airport': 'PEW',
  'peshawar': 'PEW',
  'pew': 'PEW',

  // Northern Europe
  'stockholm arlanda airport': 'ARN',
  'arlanda airport': 'ARN',
  'stockholm airport': 'ARN',
  'stockholm': 'ARN',
  'arn': 'ARN',

  'copenhagen kastrup airport': 'CPH',
  'kastrup airport': 'CPH',
  'copenhagen airport': 'CPH',
  'copenhagen': 'CPH',
  'cph': 'CPH',

  'oslo gardermoen airport': 'OSL',
  'gardermoen airport': 'OSL',
  'oslo airport': 'OSL',
  'oslo': 'OSL',
  'osl': 'OSL',

  'helsinki vantaa airport': 'HEL',
  'vantaa airport': 'HEL',
  'helsinki airport': 'HEL',
  'helsinki': 'HEL',
  'hel': 'HEL',

  'reykjavik keflavik international airport': 'KEF',
  'keflavik airport': 'KEF',
  'reykjavik airport': 'KEF',
  'reykjavik': 'KEF',
  'kef': 'KEF',

  // Eastern Europe
  'prague vaclav havel airport': 'PRG',
  'vaclav havel airport': 'PRG',
  'prague airport': 'PRG',
  'prague': 'PRG',
  'prg': 'PRG',

  'vienna international airport': 'VIE',
  'vienna airport': 'VIE',
  'vienna': 'VIE',
  'vie': 'VIE',

  'budapest ferenc liszt international airport': 'BUD',
  'ferenc liszt airport': 'BUD',
  'budapest airport': 'BUD',
  'budapest': 'BUD',
  'bud': 'BUD',

  'warsaw chopin airport': 'WAW',
  'chopin airport': 'WAW',
  'warsaw airport': 'WAW',
  'warsaw': 'WAW',
  'waw': 'WAW',

  'krakow john paul ii international airport': 'KRK',
  'john paul ii airport': 'KRK',
  'krakow airport': 'KRK',
  'krakow': 'KRK',
  'krk': 'KRK',

  'bucharest henri coanda international airport': 'OTP',
  'henri coanda airport': 'OTP',
  'bucharest airport': 'OTP',
  'bucharest': 'OTP',
  'otp': 'OTP',

  'sofia airport': 'SOF',
  'sofia': 'SOF',
  'sof': 'SOF',

  'zagreb airport': 'ZAG',
  'zagreb': 'ZAG',
  'zag': 'ZAG',

  'belgrade nikola tesla airport': 'BEG',
  'nikola tesla airport': 'BEG',
  'belgrade airport': 'BEG',
  'belgrade': 'BEG',
  'beg': 'BEG',

  'ljubljana joze pucnik airport': 'LJU',
  'joze pucnik airport': 'LJU',
  'ljubljana airport': 'LJU',
  'ljubljana': 'LJU',
  'lju': 'LJU',

  'skopje alexander the great airport': 'SKP',
  'alexander the great airport': 'SKP',
  'skopje airport': 'SKP',
  'skopje': 'SKP',
  'skp': 'SKP',

  'sarajevo international airport': 'SJJ',
  'sarajevo airport': 'SJJ',
  'sarajevo': 'SJJ',
  'sjj': 'SJJ',

  'tirana mother teresa international airport': 'TIA',
  'mother teresa airport': 'TIA',
  'tirana airport': 'TIA',
  'tirana': 'TIA',
  'tia': 'TIA',

  'pristina adem jashari international airport': 'PRN',
  'adem jashari airport': 'PRN',
  'pristina airport': 'PRN',
  'pristina': 'PRN',
  'prn': 'PRN',

  'podgorica airport': 'TGD',
  'podgorica': 'TGD',
  'tgd': 'TGD',

  // Baltic States
  'riga international airport': 'RIX',
  'riga airport': 'RIX',
  'riga': 'RIX',
  'rix': 'RIX',

  'tallinn airport': 'TLL',
  'tallinn': 'TLL',
  'tll': 'TLL',

  'vilnius international airport': 'VNO',
  'vilnius airport': 'VNO',
  'vilnius': 'VNO',
  'vno': 'VNO',

  // Greece & Cyprus
  'athens international airport': 'ATH',
  'athens airport': 'ATH',
  'athens': 'ATH',
  'ath': 'ATH',

  'thessaloniki airport': 'SKG',
  'thessaloniki': 'SKG',
  'skg': 'SKG',

  'heraklion airport': 'HER',
  'heraklion': 'HER',
  'crete airport': 'HER',
  'her': 'HER',

  'rhodes airport': 'RHO',
  'rhodes': 'RHO',
  'rho': 'RHO',

  'mykonos airport': 'JMK',
  'mykonos': 'JMK',
  'jmk': 'JMK',

  'santorini airport': 'JTR',
  'santorini': 'JTR',
  'jtr': 'JTR',

  'larnaca international airport': 'LCA',
  'larnaca airport': 'LCA',
  'larnaca': 'LCA',
  'cyprus airport': 'LCA',
  'lca': 'LCA',

  'paphos international airport': 'PFO',
  'paphos airport': 'PFO',
  'paphos': 'PFO',
  'pfo': 'PFO',

  // Portugal
  'lisbon portela airport': 'LIS',
  'portela airport': 'LIS',
  'lisbon airport': 'LIS',
  'lisbon': 'LIS',
  'lis': 'LIS',

  'porto francisco carneiro airport': 'OPO',
  'francisco carneiro airport': 'OPO',
  'porto airport': 'OPO',
  'porto': 'OPO',
  'opo': 'OPO',

  'faro airport': 'FAO',
  'faro': 'FAO',
  'fao': 'FAO',

  'funchal cristiano ronaldo international airport': 'FNC',
  'cristiano ronaldo airport': 'FNC',
  'funchal airport': 'FNC',
  'madeira airport': 'FNC',
  'funchal': 'FNC',
  'fnc': 'FNC',

  // Additional Indian Airports (Smaller Cities)
  'kishangarh airport': 'KQH',
  'ajmer airport': 'KQH',
  'kishangarh': 'KQH',
  'kqh': 'KQH',

  'kannur international airport': 'CNN',
  'kannur airport': 'CNN',
  'kannur': 'CNN',
  'cnn': 'CNN',

  'calicut international airport': 'CCJ',
  'kozhikode airport': 'CCJ',
  'calicut': 'CCJ',
  'kozhikode': 'CCJ',
  'ccj': 'CCJ',

  'kadapa airport': 'CDP',
  'cuddapah airport': 'CDP',
  'kadapa': 'CDP',
  'cuddapah': 'CDP',
  'cdp': 'CDP',

  'kurnool airport': 'KJB',
  'kurnool': 'KJB',
  'kjb': 'KJB',

  'puttaparthi airport': 'PUT',
  'puttaparthi': 'PUT',
  'put': 'PUT',

  'belgaum airport': 'IXG',
  'belagavi airport': 'IXG',
  'belgaum': 'IXG',
  'belagavi': 'IXG',
  'ixg': 'IXG',

  'dharamshala airport': 'DHM',
  'kangra airport': 'DHM',
  'dharamshala': 'DHM',
  'kangra': 'DHM',
  'dhm': 'DHM',

  'daman airport': 'NMB',
  'daman': 'NMB',
  'nmb': 'NMB',

  'rajkot airport': 'RAJ',
  'rajkot': 'RAJ',
  'raj': 'RAJ',

  'bhavnagar airport': 'BHU',
  'bhavnagar': 'BHU',
  'bhu': 'BHU',

  'porbandar airport': 'PBD',
  'porbandar': 'PBD',
  'pbd': 'PBD',

  'jamnagar airport': 'JGA',
  'jamnagar': 'JGA',
  'jga': 'JGA',

  'bhuj airport': 'BHJ',
  'bhuj': 'BHJ',
  'bhj': 'BHJ',

  'kandla airport': 'IXY',
  'kandla': 'IXY',
  'gandhidham': 'IXY',
  'ixy': 'IXY',

  'jabalpur airport': 'JLR',
  'jabalpur': 'JLR',
  'jlr': 'JLR',

  'khajuraho airport': 'HJR',
  'khajuraho': 'HJR',
  'hjr': 'HJR',

  'gwalior airport': 'GWL',
  'gwalior': 'GWL',
  'gwl': 'GWL',

  'bhopal airport': 'BHO',
  'raja bhoj airport': 'BHO',
  'bhopal': 'BHO',
  'bho': 'BHO',

  'bilaspur airport': 'PAB',
  'bilaspur': 'PAB',
  'pab': 'PAB',

  'jagdalpur airport': 'JDB',
  'jagdalpur': 'JDB',
  'jdb': 'JDB'
};

/**
 * Convert airport name/city to IATA code
 * @param {string} input - Airport name, city name, or IATA code
 * @returns {string} - IATA airport code
 */
const getAirportCode = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  const normalizedInput = input.toLowerCase().trim();
  
  // If it's already a 3-letter code, return it uppercased
  if (/^[a-z]{3}$/i.test(normalizedInput)) {
    return normalizedInput.toUpperCase();
  }
  
  // Look up in mapping
  const code = AIRPORT_MAPPING[normalizedInput];
  if (code) {
    return code;
  }
  
  // Try partial matches for city names
  for (const [key, value] of Object.entries(AIRPORT_MAPPING)) {
    if (key.includes(normalizedInput) || normalizedInput.includes(key)) {
      return value;
    }
  }
  
  // If no match found, return the original input uppercased (fallback)
  return input.toUpperCase();
};

/**
 * Validate airport code
 * @param {string} code - Airport code to validate
 * @returns {boolean} - Whether the code is valid
 */
const isValidAirportCode = (code) => {
  return /^[A-Z]{3}$/.test(code) && Object.values(AIRPORT_MAPPING).includes(code);
};

/**
 * Get airport name from code
 * @param {string} code - IATA airport code
 * @returns {string} - Airport/city name
 */
const getAirportName = (code) => {
  for (const [name, airportCode] of Object.entries(AIRPORT_MAPPING)) {
    if (airportCode === code) {
      // Return the first (usually most common) name for this code
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  return code;
};

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Build API URL with secure logging
 * @param {string} originCode - Origin airport code
 * @param {string} destinationCode - Destination airport code
 * @param {string} date - Departure date
 * @param {number} passengers - Number of passengers
 * @param {string} travelClass - Travel class
 * @returns {string} - API URL
 */
const buildApiUrl = (originCode, destinationCode, date, passengers, travelClass) => {
  const url = `https://api.flightapi.io/onewaytrip/${API_CONFIG.API_KEY}/${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/${date}/${passengers}/0/0/${travelClass}/USD`;
  
  // Log sanitized URL (without API key)
  console.log('API URL (sanitized):', sanitizeUrl(url));
  
  return url;
};

/**
 * Search for flights using Flight API
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} Promise resolving to array of flight objects
 */
export const searchFlights = async (searchParams) => {
  try {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      throw new Error('Missing required search parameters');
    }

    console.log('Original search parameters:', searchParams);

    // Convert airport names/cities to IATA codes
    const originCode = getAirportCode(searchParams.origin);
    const destinationCode = getAirportCode(searchParams.destination);
    
    console.log('Converted airport codes:', { 
      original: { origin: searchParams.origin, destination: searchParams.destination },
      converted: { origin: originCode, destination: destinationCode }
    });

    // Validate converted codes
    if (!originCode || !destinationCode) {
      throw new Error('Unable to identify airport codes. Please check your airport names or use 3-letter airport codes (e.g., DEL, BOM, JFK).');
    }

    if (originCode === destinationCode) {
      throw new Error('Origin and destination cannot be the same.');
    }

    // Validate and format other parameters
    const date = searchParams.departureDate;
    const passengers = searchParams.passengers || 1;
    const travelClass = (searchParams.travelClass || 'Economy').toLowerCase();

    // Validate date format and ensure it's in the future
    const departureDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(departureDate.getTime())) {
      throw new Error('Invalid departure date format. Please use YYYY-MM-DD format.');
    }
    
    if (departureDate < today) {
      throw new Error('Departure date must be in the future.');
    }

    // Build API URL with secure logging
    const apiUrl = buildApiUrl(originCode, destinationCode, date, passengers, travelClass);
    
    const response = await apiClient.get(apiUrl);

    console.log('API Response received:', response.data);

    // Process Flight API response
    let results = [];
    
    if (response.data && response.data.itineraries && response.data.legs) {
      const itineraries = response.data.itineraries;
      const legs = response.data.legs;
      const segments = response.data.segments;
      const carriers = response.data.carriers;
      const places = response.data.places;
      
      console.log('Found', itineraries.length, 'itineraries in API response');
      
      itineraries.forEach((itinerary, index) => {
        // Find the corresponding leg for this itinerary
        const leg = legs.find(l => l.id === itinerary.leg_ids[0]);
        
        if (leg && leg.segment_ids && leg.segment_ids.length > 0) {
          // Get the first segment
          const segment = segments.find(s => s.id === leg.segment_ids[0]);
          
          if (segment) {
            // Find carrier information
            const carrier = carriers.find(c => c.id === segment.marketing_carrier_id);
            
            // Find origin and destination places
            const originPlace = places.find(p => p.id === segment.origin_place_id);
            const destinationPlace = places.find(p => p.id === segment.destination_place_id);
            
            // Use the converted airport names
            const finalOriginName = getAirportName(originCode);
            const finalDestinationName = getAirportName(destinationCode);
            
            // Calculate price
            let price = 0;
            let currency = 'USD';
            
            // Try different possible pricing structures
            if (itinerary.pricing_options && itinerary.pricing_options.length > 0) {
              const pricingOption = itinerary.pricing_options[0];
              
              if (pricingOption.price) {
                price = pricingOption.price;
                currency = pricingOption.currency || 'USD';
              } else if (pricingOption.total_price) {
                price = pricingOption.total_price;
                currency = pricingOption.currency || 'USD';
              } else if (pricingOption.amount) {
                price = pricingOption.amount;
                currency = pricingOption.currency || 'USD';
              } else if (typeof pricingOption === 'number') {
                price = pricingOption;
              }
            } else if (itinerary.price) {
              price = itinerary.price;
              currency = itinerary.currency || 'USD';
            } else if (itinerary.total_price) {
              price = itinerary.total_price;
              currency = itinerary.total_currency || 'USD';
            }
            
            // Handle different price formats
            if (typeof price === 'object' && price !== null) {
              if (price.amount) {
                price = price.amount;
                currency = price.currency || currency;
              } else if (price.value) {
                price = price.value;
                currency = price.currency || currency;
              }
            }
            
            // Ensure price is a valid number and convert to USD if needed
            price = parseFloat(price) || 0;
            
            // Convert INR to USD (approximate rate: 1 USD = 83 INR)
            if (currency === 'INR' || currency === '₹') {
              price = price / 83;
              currency = 'USD';
            }
            
            results.push({
              id: `flight-${index + 1}`,
              airline: {
                name: carrier?.name || 'Unknown Airline',
                code: carrier?.iata_code || 'UN'
              },
              flightNumber: segment.marketing_carrier_flight_number || `FL${index + 1}`,
              origin: {
                code: originCode,
                name: finalOriginName
              },
              destination: {
                code: destinationCode,
                name: finalDestinationName
              },
              departureTime: segment.departure,
              arrivalTime: segment.arrival,
              duration: segment.duration_in_minutes || 0,
              price: price,
              originalPrice: null,
              currency: currency,
              stops: leg.segment_ids.length - 1,
              layoverCities: [],
              class: searchParams.travelClass || 'Economy',
              provider: 'Flight API',
              bookingUrl: '#',
              amenities: ['WiFi', 'Entertainment'],
              baggage: {
                carryOn: '1 included',
                checkedBags: 'Extra fee'
              }
            });
          }
        }
      });
    }

    if (results.length === 0) {
      const originName = getAirportName(originCode);
      const destinationName = getAirportName(destinationCode);
      throw new Error(`No flights found from ${originName || originCode} to ${destinationName || destinationCode} on ${date}. Try different dates or airports.`);
    }

    console.log('Final results:', results);
    return results;

  } catch (error) {
    // SECURE ERROR LOGGING - This prevents API key exposure
    secureError('Flight search error:', error);
    
    // Create sanitized error details object
    const sanitizedErrorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url ? sanitizeUrl(error.config.url) : undefined
    };
    
    secureError('Error details (sanitized):', sanitizedErrorDetails);
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      let errorMessage = 'API quota limit reached';
      
      if (errorData?.message) {
        if (errorData.message.includes('quota')) {
          errorMessage = 'Your API quota has reached its maximum limits. Please upgrade your plan to continue.';
        } else {
          errorMessage = errorData.message;
        }
      }
      
      // Include upgrade link if available
      if (errorData?.upgradeLink) {
        errorMessage += ` Visit ${errorData.upgradeLink} to upgrade your plan.`;
      }
      
      throw new Error(`API Access Denied: ${errorMessage}`);
    }
    
    if (error.response?.status === 401) {
      throw new Error('API authentication failed. Please check your API key configuration.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`No flights found for the specified route. Please check:
• Airport names are spelled correctly
• Try using 3-letter airport codes (e.g., DEL for Delhi, BOM for Mumbai)
• Verify the route exists (some airports may not have direct connections)
• Try different dates`);
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Flight service is temporarily unavailable. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Request timeout. Please try again or check your internet connection.');
    }
    
    // For other errors, throw the original error message if it's user-friendly
    if (error.message.includes('Missing required') || 
        error.message.includes('Unable to identify') || 
        error.message.includes('cannot be the same') ||
        error.message.includes('Invalid departure date') ||
        error.message.includes('must be in the future') ||
        error.message.includes('No flights found')) {
      throw error;
    }
    
    // For other errors, throw a generic error
    throw new Error(`Flight search failed: ${error.message}`);
  }
};

// Export additional utility functions for use in components
export { getAirportCode, getAirportName, isValidAirportCode, AIRPORT_MAPPING };
