import type { Project, Episode, Scene, Character, Language, VisualStyle, AspectRatio } from '../types.ts';

interface GenerateStoryInput {
  title?: string;
  category: string;
  language: Language;
  episodeCount: number;
  duration: string;
  tone: string;
  mainCharacterName?: string;
  boundCharacter?: Character;
  supportingCharacters?: string;
  villainOrRival?: string;
  setting?: string;
  storyIdea?: string;
  targetAudience?: string;
  preferredEnding?: string;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
}

export function generateCreativeStory(input: GenerateStoryInput): Project {
  const protagonist = input.boundCharacter?.name || input.mainCharacterName?.trim() || 'Kaelen the Wolf';
  const canonicalSpec = input.boundCharacter?.canonicalPrompt || 
    `${protagonist}: Powerful athletic build, piercing amber eyes, distinctive silver-tipped fur with crescent forehead marking. Retain exact visual markings, anatomy, and accessories strictly in every scene.`;

  const rival = input.villainOrRival?.trim() || 'Vorgar the Shadow Pack Hunter';
  const environment = input.setting?.trim() || 'Jagged misty obsidian peaks and ancient alpine valleys';
  const visualStyle = input.visualStyle || 'Cinematic 3D Animation';
  const ratio = input.aspectRatio || '9:16';
  const duration = input.duration || '30s';

  const defaultTitles: Record<Language, string> = {
    Urdu: `${protagonist} کی داستان: کوہِ ہمالیہ کا محافظ`,
    Hindi: `${protagonist} की महागाथा: हिमालय का रक्षक`,
    'Roman Urdu': `${protagonist} Ki Dastan: Koh-e-Himalaya Ka Muhafiz`,
    English: `${input.title?.trim() || `${input.category}: The Legend of ${protagonist}`}`
  };

  const finalTitle = input.title?.trim() || defaultTitles[input.language] || `${input.category}: The Chronicle of ${protagonist}`;

  // Summaries by language
  const summaries: Record<Language, string> = {
    Urdu: `یہ داستان ہے ${protagonist} کی، جس نے ${environment} میں اپنے قبیلے اور وادی کے بقا کے لیے ${rival} کے خلاف ایک تاریخی جنگ لڑی۔ ہر لمحہ قربانی، غیر متزلزل وفاداری اور جذباتی عزم سے بھرپور ہے۔`,
    Hindi: `यह कहानी है ${protagonist} की, जिसने ${environment} में अपने स्वाभिमान और परिवार की रक्षा के लिए ${rival} का सामना किया। यह साहस, निष्ठा और विजय की एक अमर दास्तान है।`,
    'Roman Urdu': `Yeh dastan hai ${protagonist} ki, jisne ${environment} mein apne qabeelay aur wadi ke difa ke liye ${rival} ke khilaf aik azeem ladai lari. Har scene suspense aur cinematic jazbaat se bharpoor hai.`,
    English: `An epic ${input.tone.toLowerCase()} saga following ${protagonist} navigating perilous trials across ${environment}. As tensions with ${rival} escalate, survival hinges on unyielding courage and brotherhood.`
  };

  const initialHook: Record<Language, string> = {
    Urdu: `رات کے گہرے سناٹے میں ایک چونکا دینے والی گرج نے پوری برفانی وادی کو ہلا کر رکھ دیا۔`,
    Hindi: `घने बादलों के बीच गूंजती एक रहस्यमयी गर्जना ने पूरी घाटी का सन्नाटा चीर दिया।`,
    'Roman Urdu': `Raat ke andhere mein ek aisi shua chamki jisne sadiyon purani khamoshi ko tod diya.`,
    English: `A sudden sonic tremor ripples across the obsidian crags at dawn, shattering the fragile sanctuary silence.`
  };

  const episodeCount = Math.max(1, Math.min(input.episodeCount || 3, 10));
  const episodes: Episode[] = [];

  for (let ep = 1; ep <= episodeCount; ep++) {
    const isFirst = ep === 1;
    const isLast = ep === episodeCount;

    const epTitles: Record<Language, string> = {
      Urdu: `قسط ${ep}: ${isFirst ? 'بیداری اور طوفان کا اشارہ' : isLast ? 'آخری فیصلہ کن معرکہ' : 'وادی میں بڑھتا ہوا سایہ'}`,
      Hindi: `भाग ${ep}: ${isFirst ? 'आरंभ और चेतावनी' : isLast ? 'अंतिम महायुद्ध' : 'घाटी में गहराता संकट'}`,
      'Roman Urdu': `Episode ${ep}: ${isFirst ? 'Aghaz Aur Chetawani' : isLast ? 'Aakhri Faisla-Kun Jung' : 'Toofan Ke Saaye'}`,
      English: `Episode ${ep}: ${isFirst ? 'The Awakening Tremor' : isLast ? 'The Sovereign Confrontation' : 'Shadows in the Canyon'}`
    };

    const epHooks: Record<Language, string> = {
      Urdu: isFirst ? initialHook.Urdu : `دشمن کے قدم اب برفانی درے کے دہانے تک پہنچ چکے تھے، واپسی کا کوئی راستہ باقی نہ تھا۔`,
      Hindi: isFirst ? initialHook.Hindi : `शत्रु की पदचाप अब मुख्य दर्रे तक पहुंच चुकी थी, लौटने का कोई मार्ग शेष न था।`,
      'Roman Urdu': isFirst ? initialHook['Roman Urdu'] : `Dushman ke qadam ab bilkul sar par aa chuke thay aur peechay hatne ka rasta band tha.`,
      English: isFirst ? initialHook.English : `Scout signals flare crimson across the northern ridges—retreat is no longer an option.`
    };

    const epEndings: Record<Language, string> = {
      Urdu: isLast 
        ? (input.preferredEnding?.trim() || 'اور اس طرح قربانی اور اتحاد سے وادی پر دائمی امن اور وقار کا پرچم لہرایا۔')
        : 'اچانک گھاٹی کے موڑ سے ایک پراسرار سائے نے فضا میں چھلانگ لگائی... (جاری ہے)',
      Hindi: isLast
        ? (input.preferredEnding?.trim() || 'और इस प्रकार निष्ठा और एकता की विजय हुई, घाटी में शांति की नई किरण बिखरी।')
        : 'तभी अंधेरी कंदरा से एक रहस्यमयी शक्ति प्रकट हुई... जारी रहेगा!',
      'Roman Urdu': isLast
        ? (input.preferredEnding?.trim() || 'Aakhirkaar sachai aur himmat ki azeem jeet hui, aur wadi mein aman laut aaya.')
        : 'Achanak chatan ke peeche se aik naya toofan shuru ho gaya... (To be continued)',
      English: isLast
        ? (input.preferredEnding?.trim() || 'Dawn breaks over a liberated horizon, the sacred sanctuary secured for future generations.')
        : 'A deafening roar vibrates through the canyon floor as the ground fractures beneath them... Cliffhanger!'
    };

    // Dialogues by language
    const epDialogues: Record<Language, [string, string]> = {
      Urdu: [
        `${protagonist}: "اگر ہم آج پیچھے ہٹ گئے، تو تاریخ ہمیں کبھی معاف نہیں کرے گی!"`,
        `ساتھی: "ہم تمہارے شانہ بشانہ کھڑے ہیں، چاہے چٹانیں ریزہ ریزہ ہو جائیں!"`
      ],
      Hindi: [
        `${protagonist}: "डर को पीछे छोड़ो, आज हमारे साहस और स्वाभिमान की अंतिम परीक्षा है!"`,
        `सहयोगी: "हम हर कदम पर तुम्हारे साथ खड़े रहेंगे, विजय हमारी ही होगी!"`
      ],
      'Roman Urdu': [
        `${protagonist}: "Peeche hatna hamari tareekh nahi hai, hum aakhri saans tak larenge!"`,
        `Companion: "Hum tumhare saath kharay hain, chahe pahad hil jayein!"`
      ],
      English: [
        `${protagonist}: "Stand fast! The winds yield only to those who dare cut through the storm."`,
        `Ally: "Our tracks end at this ridge, but our sovereign legend begins today."`
      ]
    };

    const scene1: Scene = {
      sceneNumber: 1,
      title: `${isFirst ? 'Sanctuary Vigil' : 'The Reconnaissance Advance'}`,
      duration: duration,
      location: `${environment} — Upper Glacier Ridge`,
      charactersPresent: [protagonist],
      continuityNotes: `Canonical character reference locked: ${canonicalSpec}. Maintain all facial scars, markings, fur texture, and accessories.`,
      action: `${protagonist} strides purposefully across wind-sculpted snowdrifts, halting at the cliff edge to inspect the misty chasm below.`,
      facialEmotion: 'Extreme alertness, piercing steely gaze, tense jawline, breath misting in biting alpine air.',
      cameraAngle: 'Low-angle hero perspective looking upward against dramatic sky',
      cameraMovement: 'Slow 180-degree clockwise orbit with gentle vertical tilt upward',
      lighting: 'Chiaroscuro dawn illumination with radiant golden hour sidelight and cool cyan rim light on fur contours',
      background: 'Towering sawtooth peaks, drifting cloud shelves, atmospheric snow dust caught in wind currents',
      dialogue: epDialogues[input.language][0],
      voiceOver: isFirst ? 'In the high sanctuary, survival is not given; it is forged.' : undefined,
      soundDesign: 'Howling mountain winds, gravel and compacted snow crunching under paws, resonant sub-bass cinematic pulse',
      musicMood: 'Tense atmospheric cello drone layered with rhythmic taiko accents',
      startFrame: `Extreme close-up on ${protagonist}'s piercing eyes, golden irises reflecting morning sun through parting fog.`,
      endFrame: `Wide heroic silhouette of ${protagonist} poised at the precipice edge as morning gale buffets coat.`,
      transition: 'Match cut on motion as protagonist leaps toward lower pass',
      flowPrompt: `Masterpiece cinematic 8k video shot, ${visualStyle} style. ${canonicalSpec}. Character standing poised upon a jagged icy precipice in ${environment}. Low-angle heroic perspective, slow orbital tracking pan. Cinematic dawn lighting with electric cyan rim light and warm amber solar flare. Anamorphic depth of field, photorealistic wind physics fluttering fur and feathers, 24fps, ${ratio} aspect ratio.`
    };

    const scene2: Scene = {
      sceneNumber: 2,
      title: `${isLast ? 'The Climax Clash' : 'Encounter at the Chasm'}`,
      duration: duration,
      location: `${environment} — Narrow Stone Bridge over Raging Chasm`,
      charactersPresent: [protagonist, rival],
      continuityNotes: `Strictly maintain canonical models: ${canonicalSpec}. The rival ${rival} must show jagged dark war paint and scarred hide.`,
      action: `Explosive kinetic confrontation as ${protagonist} lunges forward, meeting ${rival}'s attack mid-air above the roaring abyss.`,
      facialEmotion: 'Uncompromising determination, intense combat focus, teeth bared, adrenaline surge.',
      cameraAngle: 'Lateral high-speed tracking camera aligned with bridge centerline',
      cameraMovement: 'Fast forward dolly tracking with sudden slow-motion ramp at the point of apex collision',
      lighting: 'Atmospheric storm flashes, lightning reflections catching flying water droplets and sharp edges',
      background: 'Precipitous rock walls, cascading glacial waterfall in deep background, torrential mist',
      dialogue: epDialogues[input.language][1],
      soundDesign: 'Roar of rushing waterfall, heavy vocal combat snarls, explosive bone-cracking impact whoosh',
      musicMood: 'Full orchestral battle anthem with driving brass stabs and rapid war percussion',
      startFrame: `Opposing combatants sprinting toward each other from opposite sides of the ancient stone span.`,
      endFrame: `Mid-air apex collision frozen in ultra-slow motion with airborne moisture droplets suspended like glass.`,
      transition: isLast ? 'Slow cinematic fade to warm daylight' : 'Rapid whip pan into darkness',
      flowPrompt: `High-octane action blockbuster shot, ${visualStyle} style. ${canonicalSpec}. Clashing in mid-air against ${rival} above a thundering waterfall chasm in ${environment}. Lateral tracking camera with hyper-slow-motion speed ramp at apex. Dramatic storm chiaroscuro, lightning rim highlights, thousands of misty spray particles refracting light, IMAX cinematic grade, ${ratio} aspect ratio.`
    };

    episodes.push({
      episodeNumber: ep,
      title: epTitles[input.language],
      hook: epHooks[input.language],
      endingCliffhanger: epEndings[input.language],
      summary: `Episode ${ep} advances the conflict through high-stakes confrontation in ${environment}, testing ${protagonist}'s resolve.`,
      scenes: [scene1, scene2]
    });
  }

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: finalTitle,
    category: input.category,
    language: input.language,
    visualStyle: input.visualStyle,
    aspectRatio: input.aspectRatio,
    tone: input.tone,
    duration: input.duration,
    summary: summaries[input.language],
    hook: initialHook[input.language],
    characters: input.boundCharacter ? [input.boundCharacter] : [],
    episodes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function continueStoryProject(project: Project, additionalEpisodesCount: number = 2): Project {
  const currentEpCount = project.episodes.length;
  const boundChar = project.characters[0];
  const charName = boundChar?.name || 'Protagonist';

  const continuation = generateCreativeStory({
    title: project.title,
    category: project.category,
    language: project.language,
    episodeCount: additionalEpisodesCount,
    duration: project.duration,
    tone: project.tone,
    mainCharacterName: charName,
    boundCharacter: boundChar,
    visualStyle: project.visualStyle,
    aspectRatio: project.aspectRatio,
    storyIdea: `Seamless continuation from Episode ${currentEpCount}. Resolving previous cliffhangers while escalating to an even higher summit.`
  });

  const renumberedEpisodes = continuation.episodes.map((ep, idx) => ({
    ...ep,
    episodeNumber: currentEpCount + idx + 1,
    title: `Episode ${currentEpCount + idx + 1}: The Next Crucible`
  }));

  return {
    ...project,
    episodes: [...project.episodes, ...renumberedEpisodes],
    updatedAt: new Date().toISOString()
  };
}
