/* eslint-disable @next/next/no-img-element -- Tracking pixel must bypass image optimization. */
'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const COUNTER = 114717303;
let previousURL: string | undefined;

export function Metrika() {
  const pathname = usePathname();
  useEffect(() => {
    const url = location.href;
    if (previousURL && previousURL !== url) window.ym?.(COUNTER, 'hit', url, { referer: previousURL });
    previousURL = url;
  }, [pathname]);
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">{`
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=114717303','ym');
        ym(114717303,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer',referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
      `}</Script>
      <noscript><div><img src="https://mc.yandex.ru/watch/114717303" style={{ position: 'absolute', left: '-9999px' }} alt="" width="1" height="1" /></div></noscript>
    </>
  );
}
declare global { interface Window { ym?: (counter: number, action: string, ...args: unknown[]) => void } }
