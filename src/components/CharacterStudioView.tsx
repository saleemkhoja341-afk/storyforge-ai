import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  CopyCheck, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  Image as ImageIcon,
  Check,
  Wand2
} from 'lucide-react';
import { Character } from '../types';

interface CharacterStudioViewProps {
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onDuplicateCharacter: (char: Character) => void;
  onSelectCharacterForStory: (char: Character) => void;
  onEnhanceCharacterImage?: (char: Character) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CharacterStudioView: React.FC<CharacterStudioViewProps> = ({
  characters,
  onSaveCharacter,
  onDeleteCharacter,
  onDuplicateCharacter,
  onSelectCharacterForStory,
  onEnhanceCharacterImage,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('');
  const [proportions, setProportions] = useState('');
  const [faceDetails, setFaceDetails] = useState('');
  const [furClothing, setFurClothing] = useState('');
  const [distinctiveMarkings, setDistinctiveMarkings] = useState('');
  const [accessories, setAccessories] = useState('');
  const [personality, setPersonality] = useState('');
  const [voiceCharacteristics, setVoiceCharacteristics] = useState('');
  const [role, setRole] = useState<Character['role']>('Protagonist');
  const [referenceImage, setReferenceImage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingChar(null);
    setName('');
    setSpecies('Arctic Timber Wolf');
    setAge('4 years (Young Alpha)');
    setProportions('85cm shoulder height, muscular deep chest, large athletic paws');
    setFaceDetails('Piercing amber-gold eyes, silver brow whiskers, battle scar over left muzzle');
    setFurClothing('Thick ash-grey and silver double coat with charcoal spinal ridge');
    setDistinctiveMarkings('Crescent-shaped white fur patch on forehead');
    setAccessories('Braided rawhide cord around right foreleg with obsidian talisman');
    setPersonality('Stoic, vigilant, honorable, fiercely loyal to pack');
    setVoiceCharacteristics('Low guttural growl, calm and resonant baritone timbre');
    setRole('Protagonist');
    setReferenceImage('https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=600&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (char: Character) => {
    setEditingChar(char);
    setName(char.name);
    setSpecies(char.species);
    setAge(char.age);
    setProportions(char.proportions);
    setFaceDetails(char.faceDetails);
    setFurClothing(char.furClothing);
    setDistinctiveMarkings(char.distinctiveMarkings);
    setAccessories(char.accessories);
    setPersonality(char.personality);
    setVoiceCharacteristics(char.voiceCharacteristics);
    setRole(char.role);
    setReferenceImage(char.referenceImage || '');
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setReferenceImage(dataUrl);
      showToast('Reference image loaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Character name is required', 'error');
      return;
    }

    // Generate Canonical Consistency Reference Prompt
    const canonicalPrompt = `${name}: ${species}, ${age}. Proportions: ${proportions || 'athletic build'}. Facial features: ${faceDetails || 'expressive gaze'}. Fur/Plumage/Skin: ${furClothing || 'natural coat'}. Markings: ${distinctiveMarkings || 'none'}. Accessories: ${accessories || 'none'}. Personality: ${personality}. Role: ${role}. Lock exact anatomy, color palette, facial scars, and attire strictly identical across all camera angles.`;

    const charObj: Character = {
      id: editingChar ? editingChar.id : `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      species: species.trim(),
      age: age.trim(),
      proportions: proportions.trim(),
      faceDetails: faceDetails.trim(),
      furClothing: furClothing.trim(),
      distinctiveMarkings: distinctiveMarkings.trim(),
      accessories: accessories.trim(),
      personality: personality.trim(),
      voiceCharacteristics: voiceCharacteristics.trim(),
      role,
      referenceImage: referenceImage.trim() || undefined,
      canonicalPrompt,
    };

    onSaveCharacter(charObj);
    setIsModalOpen(false);
    showToast(editingChar ? `Updated character "${name}"` : `Saved character "${name}" to vault!`, 'success');
  };

  const copyPrompt = (txt: string) => {
    navigator.clipboard.writeText(txt);
    showToast('Canonical Character Prompt copied to clipboard!', 'success');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23273D] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-semibold text-violet-400">Consistency Engine</span>
            <span aria-hidden="true">·</span>
            <span>Canonical Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
            <span>Character Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Design permanent animal and human characters with anatomical specifications that lock visual consistency across video generations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Character</span>
        </button>
      </div>

      {/* Educational Banner regarding AI video generation & reference images */}
      <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 flex items-start gap-3 bg-cyan-950/10">
        <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">How Character Consistency Works:</strong> StoryForge AI generates a permanent <em>Canonical Reference Description</em> that is injected into every scene prompt. Combining this standardized prompt with a reference image in Google Flow, Runway Gen-3, or Midjourney ensures the model maintains facial markings, scars, and anatomy across shots.
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className="glass-card rounded-2xl p-5 border border-[#23273D] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#0E1018] border border-[#23273D] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {char.referenceImage ? (
                      <img src={char.referenceImage} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{char.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {char.role}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400 font-medium">
                      {char.species} · {char.age}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(char)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0E1018] transition-colors"
                    title="Edit Character"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateCharacter(char)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0E1018] transition-colors"
                    title="Duplicate Character"
                  >
                    <CopyCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${char.name}" from consistency vault?`)) {
                        onDeleteCharacter(char.id);
                        showToast(`Deleted ${char.name}`, 'info');
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                    title="Delete Character"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Anatomy & Spec Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0E1018]/80 p-3 rounded-xl border border-[#23273D] mb-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Proportions</span>
                  <span className="text-slate-300 font-medium line-clamp-1">{char.proportions || 'Standard build'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Eyes / Facial</span>
                  <span className="text-slate-300 font-medium line-clamp-1">{char.faceDetails || 'Natural eyes'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Markings / Scars</span>
                  <span className="text-slate-300 font-medium line-clamp-1">{char.distinctiveMarkings || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Accessories</span>
                  <span className="text-slate-300 font-medium line-clamp-1">{char.accessories || 'None'}</span>
                </div>
              </div>

              {/* Canonical Prompt Box */}
              <div className="bg-[#0E1018] rounded-xl p-3 border border-[#23273D]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono mb-1">
                  <span>Canonical Flow Prompt</span>
                  <button
                    onClick={() => copyPrompt(char.canonicalPrompt)}
                    className="text-violet-400 hover:text-violet-300 lowercase cursor-pointer"
                  >
                    copy prompt
                  </button>
                </div>
                <p className="text-xs text-slate-300 line-clamp-3 font-mono leading-relaxed">
                  {char.canonicalPrompt}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[#23273D] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                ID: {char.id.substring(0, 14)}
              </span>
              <div className="flex items-center gap-2">
                {onEnhanceCharacterImage && char.referenceImage && (
                  <button
                    onClick={() => onEnhanceCharacterImage(char)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Enhance character portrait in Photo Enhancer Studio"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Enhance</span>
                  </button>
                )}
                <button
                  onClick={() => copyPrompt(char.canonicalPrompt)}
                  className="px-3 py-1.5 rounded-lg bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </button>
                <button
                  onClick={() => onSelectCharacterForStory(char)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use in Story</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT CHARACTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0E1018] border border-[#23273D] w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#23273D] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <span>{editingChar ? `Edit "${editingChar.name}"` : 'Create Consistent Character'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Character Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Shadowclaw"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Species / Character Type *</label>
                  <input
                    type="text"
                    required
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Arctic Timber Wolf, Golden Eagle, Bengal Tiger"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Age / Apparent Age</label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. 5 years (Prime Alpha)"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role in Story</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Character['role'])}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Protagonist">Protagonist</option>
                    <option value="Antagonist">Antagonist / Rival</option>
                    <option value="Supporting Scout">Supporting Scout</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Companion">Companion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Height & Body Proportions</label>
                <input
                  type="text"
                  value={proportions}
                  onChange={(e) => setProportions(e.target.value)}
                  className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="e.g. 85cm shoulder height, deep muscular chest, broad paws"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Face & Eye Details</label>
                  <input
                    type="text"
                    value={faceDetails}
                    onChange={(e) => setFaceDetails(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Piercing amber-gold eyes, silver brow whiskers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fur / Feathers / Clothing</label>
                  <input
                    type="text"
                    value={furClothing}
                    onChange={(e) => setFurClothing(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Thick ash-grey double coat, charcoal spinal ridge"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Distinctive Markings / Scars</label>
                  <input
                    type="text"
                    value={distinctiveMarkings}
                    onChange={(e) => setDistinctiveMarkings(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Crescent-shaped white patch on forehead, battle scar on left muzzle"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Clothing & Accessories</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Braided rawhide cord around foreleg with obsidian bead"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Personality</label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Stoic, vigilant, honorable pack protector"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Voice Characteristics</label>
                  <input
                    type="text"
                    value={voiceCharacteristics}
                    onChange={(e) => setVoiceCharacteristics(e.target.value)}
                    className="w-full bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Low guttural growl, calm and resonant"
                  />
                </div>
              </div>

              {/* Reference Image Upload & URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reference Image (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    className="flex-1 bg-[#08090E] border border-[#23273D] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500"
                    placeholder="https://example.com/character.jpg"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-[#141724] border border-[#23273D] text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#23273D] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141724] text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md cursor-pointer"
                >
                  Save Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
