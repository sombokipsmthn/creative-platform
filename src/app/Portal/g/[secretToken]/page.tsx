// src/app/Portal/g/[secretToken]/page.tsx
'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';


interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  category?: string;
  exif?: {
    camera?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
}


interface GalleryPageProps {
  params: Promise<{
    secretToken: string;
  }>;
}



const demoGallery = {
  title: 'Clean Energy Impact Series',
  client: 'BURN Manufacturing / Delta40 Studio',
  date: 'August 2026',
  pin: '2540',

  items: [
    {
      id: 'img-01',
      title: 'Founder Field Interview',
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
      type: 'photo',
      category: 'Documentary',
      exif: {
        camera: 'Sony A7IV',
        iso: '400',
        aperture: 'f/2.8',
        shutter: '1/500s'
      }
    },

    {
      id: 'img-02',
      title: 'Factory Operations',
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
      type: 'photo',
      category: 'Production',
      exif: {
        camera: 'Sony A7IV',
        iso: '800',
        aperture: 'f/4',
        shutter: '1/250s'
      }
    },

    {
      id: 'img-03',
      title: 'Executive Portrait',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
      type: 'photo',
      category: 'Portrait'
    }
  ] as GalleryItem[]
};




export default function ClientGalleryPage({
  params
}: GalleryPageProps) {


  const resolvedParams = use(params);

  const token = resolvedParams.secretToken;


  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState('');

  const [favorites,setFavorites] = useState<string[]>([]);

  const [lightboxIndex,setLightboxIndex] =
    useState<number|null>(null);

  const [downloadOpen,setDownloadOpen] =
    useState(false);



  function verifyPin(e:React.FormEvent){

    e.preventDefault();

    if(pin === demoGallery.pin){
      setVerified(true);
    }
    else{
      alert('Incorrect PIN');
    }
  }



  function toggleFavorite(id:string){

    setFavorites(prev =>
      prev.includes(id)
      ? prev.filter(x=>x!==id)
      : [...prev,id]
    );

  }



  if(!verified){

    return (

      <main className="
      min-h-screen flex items-center justify-center
      bg-slate-50 dark:bg-[#09090b]
      px-6
      ">

        <form
        onSubmit={verifyPin}
        className="
        max-w-md w-full
        bg-white dark:bg-zinc-950
        border border-slate-200 dark:border-zinc-800
        rounded-2xl p-8 shadow-xl
        "
        >

          <h1 className="
          text-2xl text-center
          font-bold tracking-widest
          "
          >
            KIPSMTHN<span className="text-purple-500">.</span>
          </h1>


          <p className="
          text-center mt-3
          text-xs font-mono
          uppercase tracking-widest
          text-purple-500
          ">
            Private Client Gallery
          </p>


          <input

          value={pin}
          onChange={(e)=>setPin(e.target.value)}

          maxLength={4}

          placeholder="PIN"

          className="
          mt-8 w-full
          text-center text-3xl
          tracking-[0.5em]
          rounded-xl
          bg-slate-100 dark:bg-zinc-900
          p-3
          "
          />


          <button
          className="
          mt-5 w-full
          py-3
          rounded-xl
          bg-purple-600
          text-white
          text-xs font-mono uppercase
          "
          >

            Access Gallery

          </button>


        </form>


      </main>

    );

  }




  return (

<div className="
min-h-screen
bg-slate-50 dark:bg-[#09090b]
text-slate-900 dark:text-white
">


<header className="
sticky top-0 z-40
border-b
bg-white/80 dark:bg-zinc-950/80
backdrop-blur
">

<div className="
max-w-7xl mx-auto px-6 h-16
flex justify-between items-center
">


<Link
href="/"
className="font-bold tracking-widest"
>
KIPSMTHN<span className="text-purple-500">.</span>
</Link>


<div className="flex gap-3 items-center">

<button
onClick={()=>setDownloadOpen(true)}
className="
px-4 py-2
rounded-full
bg-purple-600
text-white
text-xs font-mono
"
>
Download ({favorites.length})
</button>


<ThemeToggle />

</div>

</div>

</header>



<section className="
max-w-7xl mx-auto
px-6 py-12
">

<p className="
text-xs font-mono text-purple-500 uppercase
">
{token}
</p>


<h1 className="
text-4xl font-light mt-3
">
{demoGallery.title}
</h1>


<p className="
text-sm text-zinc-500 mt-2
">
{demoGallery.client} • {demoGallery.date}
</p>


</section>



<main className="
max-w-7xl mx-auto px-6 pb-32
">

<div className="
grid md:grid-cols-3 gap-6
">


{demoGallery.items.map((item,index)=>{


const fav=favorites.includes(item.id);


return (

<div
key={item.id}
className="
rounded-2xl overflow-hidden
border
bg-white dark:bg-zinc-900
"
>


<div
className="
relative aspect-video
cursor-pointer
"
onClick={()=>setLightboxIndex(index)}
>

<Image

src={item.url}

alt={item.title}

fill

className="object-cover"

unoptimized

/>

</div>


<div className="p-4 flex justify-between">

<p className="text-sm">
{item.title}
</p>


<button
onClick={()=>toggleFavorite(item.id)}
>
{fav?'♥':'♡'}
</button>


</div>


</div>

);


})}


</div>

</main>



{lightboxIndex!==null && (

<ClientLightbox

isOpen={true}

item={demoGallery.items[lightboxIndex]}

onClose={()=>setLightboxIndex(null)}

onNext={()=>{}}

onPrev={()=>{}}

isFavorite={
favorites.includes(
demoGallery.items[lightboxIndex].id
)
}

onToggleFavorite={toggleFavorite}

/>

)}



<DownloadModal

isOpen={downloadOpen}

onClose={()=>setDownloadOpen(false)}

requiresPin={true}

correctPin={demoGallery.pin}

totalItemsCount={demoGallery.items.length}

favoritesCount={favorites.length}

/>



</div>

  );

}