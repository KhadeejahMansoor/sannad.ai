// components/HadithSourceTags.js

export function HadithSourceTag({ label, bgColor, width = 'w-28' }) {
  return (
    <div
      className={`h-7 px-4 py-1 ${bgColor} ${width} rounded-[10px] inline-flex items-center justify-center`}
    >
      <div className="w-full flex justify-center">
        <span className="text-center text-[#6B5B55] text-sm font-medium font-['Inter'] whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function HadithSourceTags() {
  return (
    <div className="flex flex-wrap gap-2">
      <HadithSourceTag label="Bukhari 7405" bgColor="bg-orange-200" />
      <HadithSourceTag label="Muslim 2675" bgColor="bg-red-200" />
      <HadithSourceTag label="Abu Dawud 2451" bgColor="bg-lime-100" width="w-36" />
      <HadithSourceTag label="Tirmidhi 3405" bgColor="bg-sky-200" />
      <HadithSourceTag label="Nasai 1405" bgColor="bg-indigo-200" width="w-24" />
      <HadithSourceTag label="Ibn Majah 2405" bgColor="bg-purple-300" width="w-32" />
      <HadithSourceTag label="Ahmad 7405" bgColor="bg-blue-100" />
      <HadithSourceTag label="Malik 931" bgColor="bg-lime-200" width="w-24" />
      <HadithSourceTag label="Azami 7405" bgColor="bg-orange-200" />
      <HadithSourceTag label="Other 128" bgColor="bg-pink-200" width="w-24" />
      <HadithSourceTag label="Fabricated" bgColor="bg-pink-200" width="w-28" />
     
    </div>
  );
}